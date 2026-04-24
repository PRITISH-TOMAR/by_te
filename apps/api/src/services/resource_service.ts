import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api_reponse";
import { ShortenedURLDTO } from "../dto/response/resources/shortened_resource";
import { ERROR } from "../constants/error";

export const ShortenResource = async (
  req: Request,
  res: Response<ApiResponse<ShortenedURLDTO>>
) => {
  try {
    const data = new ShortenedURLDTO({
        originalUrl:  "https://example.com/very/long/url",
        shortenedUrl: "https://by.te/abc123",
        expiresAt:    "2024-12-31T00:00:00.000Z",
        createdAt:    new Date(),
        updatedAt:    new Date(),
    });

    return res.status(StatusCodes.OK).json(ApiResponse.success(data));

  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.failure(ERROR.HEALTH_CHECK_FAILURE));
  }
};