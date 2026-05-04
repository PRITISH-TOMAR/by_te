import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../config/logger";
import { ERROR } from "../constants/error";
import { MESSAGES } from "../constants/messages";
import {
  LoginRequestDTO,
  SignupRequestDTO,
} from "../dto/request/auth/auth_request_dto";
import { AuthResponseDTO } from "../dto/response/auth/auth_response";
import UserRepository from "../repositories/user_repository";
import { ApiResponse } from "../utils/api_reponse";
import { hashPassword, signAuthToken, verifyPassword } from "../utils/auth_helper";

export const signup = async (
  req: Request<{}, {}, SignupRequestDTO>,
  res: Response<ApiResponse<AuthResponseDTO>>,
) => {
  const { email, password } = req.body;
  const tracebackId = req.tracebackId;

  try {
    const existingUser = await UserRepository.findByEmail(email);

    if (existingUser) {
      return res
        .status(StatusCodes.CONFLICT)
        .json(ApiResponse.failure("Email already registered", "EMAIL_ALREADY_REGISTERED"));
    }

    const { passwordHash, passwordSalt } = await hashPassword(password);
    const userId = await UserRepository.createUser({
      email,
      passwordHash,
      passwordSalt,
    });

    const token = signAuthToken({ userId, email });
    const data = new AuthResponseDTO({
      userId,
      email,
      planType: "FREE",
      token,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(data, MESSAGES.SIGNUP_SUCCESSFULLY));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    logger.error({
      message: ERROR.INTERNAL_SERVER_ERROR,
      tracebackId,
      error,
    });

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.failure(message));
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequestDTO>,
  res: Response<ApiResponse<AuthResponseDTO>>,
) => {
  const { email, password } = req.body;
  const tracebackId = req.tracebackId;

  try {
    const user = await UserRepository.findByEmail(email);

    if (!user || !user.is_active) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ApiResponse.failure("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    const isPasswordValid = await verifyPassword({
      password,
      passwordHash: user.password_hash,
      passwordSalt: user.password_salt,
    });

    if (!isPasswordValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ApiResponse.failure("Invalid credentials", "INVALID_CREDENTIALS"));
    }

    const token = signAuthToken({ userId: user.id, email: user.email });
    const data = new AuthResponseDTO({
      userId: user.id,
      email: user.email,
      planType: user.plan_type,
      token,
    });

    return res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(data, MESSAGES.LOGIN_SUCCESSFULLY));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    logger.error({
      message: ERROR.INTERNAL_SERVER_ERROR,
      tracebackId,
      error,
    });

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.failure(message));
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse<null>>,
) => {
  return res
    .status(StatusCodes.OK)
    .json(ApiResponse.success(null, MESSAGES.LOGOUT_SUCCESSFULLY));
};
