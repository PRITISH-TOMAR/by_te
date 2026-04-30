import { claimBatchFromRedis } from "./redis_module";
import { constants } from "../../constants/constants";
import { numberToShortCode } from "../resource_helper";
import logger from "../../config/logger";
import { ShortCodeDBO } from "../../dbo/short_code";

// State
interface Batch {
  start: number;
  end: number;
  current: number;
}

let activeBatch: Batch | null = null;
let nextBatch: Omit<Batch, "current"> | null = null;
let isPrefetching: boolean = false;

//  Getters

export const getActiveBatch = (): Batch | null => activeBatch;
export const getNextBatch = (): Omit<Batch, "current"> | null => nextBatch;
export const resetBatchState = (): void => {
  activeBatch = null;
  nextBatch = null;
  isPrefetching = false;
};

//  Prefetch

export const prefetchNextBatch = async (tracebackId: string): Promise<void> => {
  if (isPrefetching || nextBatch) return;

  isPrefetching = true;

  try {
    const batch = await claimBatchFromRedis();
    nextBatch = { start: batch.start, end: batch.end };

    logger.info({
      message: "Prefetched next batch",
      source: "prefetchNextBatch → batch_module",
      tracebackId,
      data: { start: batch.start, end: batch.end },
    });
  } catch (err) {
    logger.warn({
      message: "Prefetch failed",
      source: "prefetchNextBatch → batch_module",
      tracebackId,
      data: { error: (err as Error).message },
    });
  } finally {
    isPrefetching = false;
  }
};

// Redis Batch

export const getNextShortCodeFromRedis = async (
  tracebackId: string,
): Promise<ShortCodeDBO> => {
  // 1. No active batch → claim one
  if (!activeBatch) {
    const batch = await claimBatchFromRedis();
    activeBatch = { ...batch, current: batch.start };

    logger.info({
      message: "Claimed initial batch from Redis",
      source: "getNextShortCodeFromRedis → batch_module",
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
        source: "getNextShortCodeFromRedis → batch_module",
        tracebackId,
        data: { start: activeBatch.start, end: activeBatch.end },
      });
    } else {
      const batch = await claimBatchFromRedis();
      activeBatch = { ...batch, current: batch.start };

      logger.info({
        message: "Claimed new batch synchronously (no prefetch ready)",
        source: "getNextShortCodeFromRedis → batch_module",
        tracebackId,
        data: { start: activeBatch.start, end: activeBatch.end },
      });
    }
  }

  const currentCounter: number = activeBatch.current;
  // 3. Serve current
  const shortCode = numberToShortCode(currentCounter);
  activeBatch.current++;

  // 4. Trigger prefetch at 80% usage (non-blocking)
  const usage =
    (activeBatch.current - activeBatch.start) / constants.BATCH_SIZE;
  if (usage >= constants.PREFETCH_THRESHOLD) {
    prefetchNextBatch(tracebackId).catch(() => {});
  }

  return new ShortCodeDBO({shortCode, counterId: currentCounter});
};
