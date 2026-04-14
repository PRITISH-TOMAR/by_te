import { createClient, RedisClientType } from "redis";

// validate env
const { REDIS_ADDR } = process.env;

if (!REDIS_ADDR) {
  throw new Error("REDIS_ADDR is not defined");
}

// create client
const client: RedisClientType = createClient({
  url: `redis://${REDIS_ADDR}`,
});

// error handling
client.on("error", (err: Error) => {
  console.error("Redis error:", err.message);
});

// connect function (IMPORTANT)
export const connectRedis = async (): Promise<void> => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Connected to Redis");
  }
};

export default client;