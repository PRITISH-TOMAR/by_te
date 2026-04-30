import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodSchema } from "zod";
import { ApiResponse } from "../utils/api_reponse";

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join(", ");

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ApiResponse.failure(message, "VALIDATION_ERROR"));
    }

    req.body = result.data;
    return next();
  };
