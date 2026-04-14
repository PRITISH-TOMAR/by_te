import { Response } from "express";
import { ApiResponse } from "../utils/api_reponse";
import { HealthResponseDTO } from "../dto/response/health_response";
import { HealthStatus } from "../dto/response/health_types";
import { checkMySQL, checkRedis } from "../repositories/health_repository";
import { StatusCodes } from "http-status-codes";
import { ERROR } from "../constants/error";

export const checkHealth = async (
  res: Response<ApiResponse<HealthResponseDTO>>,
) => {
  try {
    const databaseStatus: HealthStatus = await checkMySQL();
    const redisStatus: HealthStatus = await checkRedis();

    const data: HealthResponseDTO = {
      server: "UP",
      database: databaseStatus,
      redis: redisStatus,
    };

    return res.status(StatusCodes.OK).json(ApiResponse.success(data));
  } catch {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ApiResponse.failure(ERROR.HEALTH_CHECK_FAILURE));
  }
};
