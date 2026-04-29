import client from "../config/redis";
import ResourceRepository from "../repositories/resource_repository";
import {
  getServerIP,
  getServerBatchKey,
  getGlobalCounterKey,
} from "../utils/server_identity";
import { constants } from "../constants/constants";
import logger from "../config/logger";
import { generateShortCode, numberToShortCode } from "../utils/resource_helper";
import { checkRedis } from "../repositories/health_repository";
import pool from "../config/mysql";
import BatchQueries from "../queries/batch_queries";

// Batch Interface
export interface Batch {
  start: number;
  end: number;
  current: number;
}

// Mode of truth source
export type Mode = "redis" | "db";

// Server State
let mode: Mode = "redis";
let activeBatch: Batch | null = null;
let nextBatch: Omit<Batch, "current"> | null = null;
let isPrefetching: boolean = false;

const isRedisAlive = async (): Promise<boolean> => {
  return (await checkRedis()) === "UP";
};

const claimBatchFromRedis = async (): Promise<Batch> => {
  const end = await client.incrBy(
    constants.REDIS_COUNTER_KEY,
    constants.BATCH_SIZE,
  );
  const start = end - constants.BATCH_SIZE + 1;
  return { start, end, current: start };
};

const claimNextFromDB = async (): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.query(
      BatchQueries.GET_COUNTER_FROM_DB,
    );

    const next = rows[0].counter + 1;

    await connection.query(BatchQueries.UPDATE_COUNTER_IN_DB, [next]);

    await connection.commit();
    return next;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// Prefetch logic
const prefetchNextBatch = async (tracebackId: string): Promise<void> => {
  if (isPrefetching || nextBatch) return;

  isPrefetching = true;

  try {
    const batch = await claimBatchFromRedis();
    nextBatch = { start: batch.start, end: batch.end };

    logger.info({
      message: "Prefetched next batch",
      source: "prefetchNextBatch → batch_service",
      tracebackId,
      data: { start: batch.start, end: batch.end },
    });
  } catch (err) {
    logger.warn({
      message: "Prefetch failed",
      source: "prefetchNextBatch → batch_service",
      tracebackId,
      data: { error: (err as Error).message },
    });
  } finally {
    isPrefetching = false;
  }
};

const getNextShortCodeFromRedis = async (
  tracebackId: string,
): Promise<string> => {
  // 1. No active batch → claim one
  if (!activeBatch) {
    activeBatch = await claimBatchFromRedis();

    logger.info({
      message: "Claimed initial batch from Redis",
      source: "getNextShortCodeFromRedis → batch_service",
      tracebackId,
      data: { start: activeBatch.start, end: activeBatch.end },
    });
  }

  // 2. Active batch exhausted → promote next or claim new
  if (activeBatch.current > activeBatch.end) {
    if (nextBatch) {
      activeBatch = { ...nextBatch, current: nextBatch.start };
      nextBatch = null;

      logger.info({
        message: "Promoted prefetched batch to active",
        source: "getNextShortCodeFromRedis → batch_service",
        tracebackId,
        data: { start: activeBatch.start, end: activeBatch.end },
      });
    } else {
      activeBatch = await claimBatchFromRedis();

      logger.info({
        message: "Claimed new batch synchronously (no prefetch ready)",
        source: "getNextShortCodeFromRedis → batch_service",
        tracebackId,
        data: { start: activeBatch.start, end: activeBatch.end },
      });
    }
  }

  // 3. Serve current
  const shortCode = numberToShortCode(activeBatch.current);
  activeBatch.current++;

  // 4. Trigger prefetch at 80% usage (non-blocking)
  const usage =
    (activeBatch.current - activeBatch.start) / constants.BATCH_SIZE;
  if (usage >= constants.PREFETCH_THRESHOLD) {
    prefetchNextBatch(tracebackId).catch(() => {});
  }

  return shortCode;
};


// DB Mode 
const getNextShortCodeFromDB = async (tracebackId: string): Promise<string> => {
  const counter = await claimNextFromDB();
  logger.info({
    message:     "Short code generated from DB counter",
    source:      "getNextShortCodeFromDB → batch_service",
    tracebackId,
    data:        { counter },
  });

  return numberToShortCode(counter);
};


export const getNextShortCode = async (tracebackId: string): Promise<string> => {

  // Redis mode
  if (mode === "redis") {
    try {
      const alive = await isRedisAlive();

      if (!alive) throw new Error("Redis unavailable");

      return await getNextShortCodeFromRedis(tracebackId);

    } catch (err) {
      // Switch to DB mode — permanent for this process lifecycle
      mode        = "db";
      activeBatch = null;
      nextBatch   = null;

      logger.warn({
        message:     "Redis failed — switching to DB mode permanently for this process",
        source:      "getNextShortCode → batch_service",
        tracebackId,
        data:        { error: (err as Error).message },
      });
    }
  }

  // DB mode
  try {
    return await getNextShortCodeFromDB(tracebackId);

  } catch (err) {
    // Last resort — random short code, DB unique constraint prevents duplicates
    logger.error({
      message:     "DB also failed — using random short code as last resort",
      source:      "getNextShortCode → batch_service",
      tracebackId,
      data:        { error: (err as Error).message },
    });

    return generateShortCode();
  }
};

export const getCurrentMode = (): Mode => mode;


const getBatchStartKey = () => `${getServerBatchKey()}:start`;
const getBatchEndKey = () => `${getServerBatchKey()}:end`;
const getBatchCounterKey = () => `${getServerBatchKey()}:counter`;