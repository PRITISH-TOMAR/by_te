import db from "../config/mysql";
import redis from "../config/redis";
import { HealthStatus} from "../dto/response/health_types";

// MySQL check
export const checkMySQL = async (): Promise<HealthStatus> => {
  try {
    await db.execute("SELECT 1");
    return "UP";
  } catch {
    return "DOWN";
  }
};

// Redis check
export const checkRedis = async (): Promise<HealthStatus> => {
  try {
    if (!redis) {
      return "DOWN";
    }

    if (!redis.isOpen || !redis.isReady) {
      return "DOWN";
    }

    await redis.ping();
    return "UP";
  } catch {
    return "DOWN";
  }
};
