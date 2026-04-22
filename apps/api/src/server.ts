import express, { Application } from "express";
import healthRouter from "./routes/health_routes";
import dotenv from "dotenv";
import client, { connectRedis } from "./config/redis";
import pool from "./config/mysql";

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 8080;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/", healthRouter);

// bootstrap
const bootstrap = async (): Promise<void> => {
  try {
    await connectRedis();
    

    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server failed to start:", (err as Error).message);
    process.exit(1);
  }
};

// graceful shutdown
process.on("SIGTERM", async () => {
  await pool.end();
  await client.quit();
  process.exit(0);
});

bootstrap();