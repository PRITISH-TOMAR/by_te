import { isRedisAlive } from "../utils/modules/redis_module";
import { claimNextFromDB } from "../utils/modules/db_module";
import {
  getNextShortCodeFromRedis,
  resetBatchState,
} from "../utils/modules/batch_module";
import { numberToShortCode, generateShortCode } from "../utils/resource_helper";
import logger from "../config/logger";
import { isRedisConfigured } from "../config/redis";

export type Mode = "redis" | "db";

let mode: Mode = isRedisConfigured ? "redis" : "db";

export const getCurrentMode = (): Mode => mode;

export const getNextShortCode = async (
  tracebackId: string,
): Promise<string> => {
  // Redis Mode
  if (mode === "redis") {
    try {
      const alive = await isRedisAlive();
      if (!alive) throw new Error("Redis unavailable");

      return await getNextShortCodeFromRedis(tracebackId);
    } catch (err) {
      mode = "db";
      resetBatchState();

      logger.warn({
        message: "Redis failed — switching to DB mode permanently",
        source: "getNextShortCode → batch_service",
        tracebackId,
        data: { error: (err as Error).message },
      });
    }
  }

  // DB Mode
  try {
    const counter = await claimNextFromDB();

    logger.info({
      message: "Short code generated from DB counter",
      source: "getNextShortCode → batch_service",
      tracebackId,
      data: { counter },
    });

    return numberToShortCode(counter);
  } catch (err) {
    // Last resort
    logger.error({
      message: "DB also failed — using random short code as last resort",
      source: "getNextShortCode → batch_service",
      tracebackId,
      data: { error: (err as Error).message },
    });

    return generateShortCode();
  }
};
