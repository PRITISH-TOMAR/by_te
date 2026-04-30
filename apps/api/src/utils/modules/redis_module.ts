import client from "../../config/redis";
import { constants } from "../../constants/constants";
import { checkRedis } from "../../repositories/health_repository";
import logger from "../../config/logger";
import { getCounterFromDB, syncCounterToDB } from "./db_module";

//  Health
export const isRedisAlive = async (): Promise<boolean> => {
  return (await checkRedis()) === "UP";
};

// Counter & Initialization
export const claimBatchFromRedis = async (): Promise<{
  start: number;
  end: number;
}> => {
  if (!client?.isOpen) {
    throw new Error("Redis unavailable");
  }

  const key = constants.REDIS_COUNTER_KEY;

  // 1. Check if key exists
  const exists = await client.exists(key);

  // 2. If not, initialize from DB
  if (!exists) {
    const maxId = await getCounterFromDB(); // SELECT MAX(id)
    await client.set(key, maxId ?? 0);
  }

  // 3. Allocate batch
  const end = await client.incrBy(key, constants.BATCH_SIZE);
  
  await syncCounterToDB(end);

  const start = end - constants.BATCH_SIZE + 1;

  return { start, end };
};
// URL Cache
export const cacheURL = async (
  shortCode: string,
  originalUrl: string,
  expiresAt: string | null,
  tracebackId: string,
): Promise<void> => {
  try {
    if (!client?.isOpen) return;
    await client.set(
      `url:${shortCode}`,
      JSON.stringify({ redirectUrl: originalUrl, expiresAt, shortCode }),
      { EX: constants.URL_CACHE_TTL },
    );
  } catch {
    logger.warn({
      message: "Failed to cache URL in Redis",
      source: "cacheURL → redis_module",
      tracebackId,
      data: { shortCode },
    });
  }
};

export const fetchCachedURL = async (
  shortCode: string,
  tracebackId: string,
): Promise<string | null> => {
  try {
    if (!client?.isOpen) return null;
    const cached = await client.get(`url:${shortCode}`);
    if (!cached) return null;

    logger.info({
      message: "Cache hit",
      source: "fetchCachedURL → redis_module",
      tracebackId,
      data: { shortCode },
    });

    return JSON.parse(cached).redirectUrl;
  } catch {
    logger.warn({
      message: "Redis fetch failed",
      source: "fetchCachedURL → redis_module",
      tracebackId,
      data: { shortCode },
    });
    return null;
  }
};

export const deleteCachedURL = async (
  shortCode: string,
  tracebackId: string,
): Promise<void> => {
  try {
    if (!client?.isOpen) return;
    await client.del(`url:${shortCode}`);
  } catch {
    logger.warn({
      message: "Failed to delete cached URL",
      source: "deleteCachedURL → redis_module",
      tracebackId,
      data: { shortCode },
    });
  }
};

export const updateCachedURL = async (
  shortCode: string,
  originalUrl: string,
  expiresAt: string | null,
  tracebackId: string,
): Promise<void> => {
  await deleteCachedURL(shortCode, tracebackId);
  await cacheURL(shortCode, originalUrl, expiresAt, tracebackId);
};
