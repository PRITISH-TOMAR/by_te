import "dotenv/config";
import { createClient, RedisClientType } from "redis";
import logger from "./logger";

const REDIS_ADDR = process.env.REDIS_ADDR?.trim();
const REDIS_TIMEOUT_MS = Number(process.env.REDIS_TIMEOUT_MS) || 3000;

export const isRedisConfigured =
  process.env.REDIS_ENABLED !== "false" && Boolean(REDIS_ADDR);

const client: RedisClientType | null = isRedisConfigured
  ? createClient({
      url: `redis://${REDIS_ADDR}`,
      socket: {
        connectTimeout: REDIS_TIMEOUT_MS,
        reconnectStrategy: false,
      },
    })
  : null;

// Keep the client error event handled; callers decide whether to log fallback.
client?.on("error", () => undefined);

// connect function (IMPORTANT)
export const connectRedis = async (): Promise<boolean> => {
  if (!client) {
    logger.info({
      message: "Redis not configured; running in DB mode",
      source: "connectRedis -> redis.ts",
    });
    return false;
  }

  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (err) {
      logger.warn({
        message: "Redis unavailable at startup; continuing in DB mode",
        source: "connectRedis -> redis.ts",
        data: { error: (err as Error).message },
      });
      return false;
    }
  }

  logger.info({
    message: "Redis connected",
    source: "connectRedis -> redis.ts",
  });

  return true;
};

export default client;
