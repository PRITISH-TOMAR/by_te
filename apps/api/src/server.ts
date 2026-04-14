import express, { Application } from "express";

import healthRouter from "./routes/health_routes";

const app: Application = express();

// middleware
app.use(express.json());

// routes
app.use("/", healthRouter);

// start server
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});