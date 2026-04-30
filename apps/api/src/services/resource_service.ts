import "../types/express";
import { ShortenRequestDTO } from "../dto/request/resources/shorten_request_dto";
import { ShortenedResponseDTO } from "../dto/response/resources/shortened_resource";
import logger from "../config/logger";
import ResourceRepository from "../repositories/resource_repository";
import { ApiResponse } from "../utils/api_reponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getNextShortCode } from "./batch_service";
import { cacheURL } from "../utils/modules/redis_module";
import { MESSAGES } from "../constants/messages";

export const ShortenResource = async (
  req: Request<{}, {}, ShortenRequestDTO>,
  res: Response<ApiResponse<ShortenedResponseDTO>>,
) => {
  const body = req.body;
  const tracebackId = req.tracebackId;

  try {
    if (!body || !body.originalUrl) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          ApiResponse.failure("originalUrl is required", "BAD_REQUEST"),
        );
    }

    

    if (body.customAlias) {
      const existing = await ResourceRepository.findByShortCode(
        body.customAlias,
      );

      if (existing) {
        return res
          .status(StatusCodes.CONFLICT)
          .json(
            ApiResponse.failure(
              "Custom alias already taken",
              "CUSTOM_ALIAS_ALREADY_EXISTS",
            ),
          );
      }
    }

    // Generate short code
    const shortCode = body.customAlias ?? (await getNextShortCode(tracebackId));
 
    // Insert into DB
    await ResourceRepository.insertURL(body, shortCode);

    // Fetch inserted row
    const row = await ResourceRepository.findByShortCode(shortCode);

    // Cache (non-blocking)
    cacheURL(shortCode, row.original_url, row.expires_at, tracebackId).catch(
      (err) =>
        logger.error({
          message: "Redis cache failed",
          tracebackId,
          error: err,
        }),
    );

    logger.info({
      message: "URL shortened successfully",
      source: "shortenURL → shorten_service",
      tracebackId,
      data: { resourceId: row.id, shortCode },
    });

    const data = new ShortenedResponseDTO({
      originalUrl: row.original_url,
      shortenedUrl: `${shortCode}`,
      expiresAt: row.expires_at,
      customAlias: body.customAlias,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(data, MESSAGES.URL_SHORTENED_SUCCESSFULLY));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    logger.error({
      message: "Error in ShortenResource",
      tracebackId,
      error,
    });

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.failure(message));
  }
};
