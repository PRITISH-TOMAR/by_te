import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api_reponse";
import { verifyAuthToken } from "../utils/auth_helper";

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorizationHeader = req.headers.authorization;
  const [scheme, token] = authorizationHeader?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ApiResponse.failure("Missing bearer token", "UNAUTHORIZED"));
  }

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ApiResponse.failure("Invalid or expired token", "UNAUTHORIZED"));
  }
};
