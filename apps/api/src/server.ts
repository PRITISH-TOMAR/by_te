import express, { Application } from "express";
import healthRouter from "./routes/health_routes";
import dotenv from "dotenv";

dotenv.config();
const app: Application = express();
const PORT: number = Number(process.env.PORT) || 8080;

// middleware
app.use(express.json());

// routes
app.use("/", healthRouter);

// start server


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});