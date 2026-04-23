import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger";

// Attach tracebackId to every request
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const tracebackId = uuidv4();
  const start = Date.now();

  // Attach to request so it can be used in services
  (req as any).tracebackId = tracebackId;

  res.on("finish", () => {
    logger.info({
      message:     "Incoming request",
      source:      "requestLogger middleware",
      tracebackId,
      url:         req.originalUrl,
      httpMethod:  req.method,
      data: {
        status:    res.statusCode,
        duration:  `${Date.now() - start}ms`,
        ip:        req.ip,
      },
    });
  });

  next();
};