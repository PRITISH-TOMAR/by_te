import express, { Application } from "express";
import healthRouter from "./routes/health_routes";
import dotenv from "dotenv";
import client, { connectRedis } from "./config/redis";
import pool from "./config/mysql";
import { requestLogger } from "./middleware/requestLogger";
import logger from "./config/logger";

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 8080;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// routes
app.use("/", healthRouter);

// bootstrap
const bootstrap = async (): Promise<void> => {
  try {
    await connectRedis();
    logger.info({
      message: "Redis connected",
      source:  "bootstrap → server.ts",
    });

    await pool.query("SELECT 1");
    logger.info({
      message: "MySQL connected",
      source:  "bootstrap → server.ts",
    });

    app.listen(PORT, () => {
      logger.info({
        message: `Server running on port: ${PORT}`,
        source:  "bootstrap → server.ts",
        data:    { port: PORT, env: process.env.APP_ENV },
      });
    });

  } catch (err) {
    logger.error({
      message:    "Server failed to start",
      source:     "bootstrap → server.ts",
      stackTrace: (err as Error).stack,
    });
    process.exit(1);
  }
};

// graceful shutdown
process.on("SIGTERM", async () => {
  logger.info({
    message: "SIGTERM received, shutting down gracefully",
    source:  "process.SIGTERM → server.ts",
  });
  await pool.end();
  await client.quit();
  process.exit(0);
});

bootstrap();