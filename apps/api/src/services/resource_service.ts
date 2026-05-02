import "../types/express";
import { ShortenRequestDTO } from "../dto/request/resources/shorten_request_dto";
import { ShortenedResponseDTO } from "../dto/response/resources/shortened_resource";
import logger from "../config/logger";
import ResourceRepository from "../repositories/resource_repository";
import { ApiResponse } from "../utils/api_reponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getNextShortCode } from "./batch_service";
import { cacheURL, fetchCachedURL } from "../utils/modules/redis_module";
import { MESSAGES } from "../constants/messages";
import { ShortCodeDBO } from "../dbo/short_code";
import { ERROR } from "../constants/error";
import { QrCodeHelper } from "../utils/qr_code_helper";

export const ShortenResource = async (
  req: Request<{}, {}, ShortenRequestDTO>,
  res: Response<ApiResponse<ShortenedResponseDTO>>,
) => {
  const body = req.body;
  const tracebackId = req.tracebackId;

  try {
    let shortCode: ShortCodeDBO;
    if (body.customAlias) {
      const existing = await ResourceRepository.findByShortCode(
        body.customAlias,
      );

      if (existing) {
        return res
          .status(StatusCodes.CONFLICT)
          .json(ApiResponse.failure("Custom alias already taken"));
      }

      shortCode = new ShortCodeDBO({
        shortCode: body.customAlias,
        counterId: 0,
      });
    }

    // Generate short code
    shortCode = await getNextShortCode(tracebackId);

    if(body.isQr){
     const QrCodeUrl =  QrCodeHelper.generateQRCodeURL(body.originalUrl, shortCode.shortCode);
     
    }



    // Insert into DB
    await ResourceRepository.insertURL(body, shortCode);

    // Fetch inserted row
    const row = await ResourceRepository.findByShortCode(shortCode.shortCode);

    // Cache (non-blocking)
    cacheURL(
      shortCode.shortCode,
      row.original_url,
      row.expires_at,
      tracebackId,
    ).catch((err) =>
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
      shortenedUrl: `${shortCode.shortCode}`,
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
      message: ERROR.INTERNAL_SERVER_ERROR,
      tracebackId,
      error,
    });

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.failure(message));
  }
};

const getResource = async (
  req: Request<{ shortCode: string }>,
  res: Response<ApiResponse<ShortenedResponseDTO>>,
) => {
  const { shortCode } = req.params;
  const tracebackId = req.tracebackId;

  try {
    const cachedUrl = await fetchCachedURL(shortCode, tracebackId);
    if (cachedUrl) {
      return res.redirect(cachedUrl);
    }

    const row = await ResourceRepository.findByShortCode(shortCode);
    if (!row || !row.is_active) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ApiResponse.failure("Resource not found", "RESOURCE_NOT_FOUND"));
    }

    if (row.activate_at && new Date(row.activate_at) > new Date()) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ApiResponse.failure("Resource not found", "RESOURCE_NOT_FOUND"));
    }

    if (row.expires_at && new Date(row.expires_at) <= new Date()) {
      return res
        .status(StatusCodes.GONE)
        .json(ApiResponse.failure("Resource expired", "RESOURCE_EXPIRED"));
    }

    cacheURL(shortCode, row.original_url, row.expires_at, tracebackId).catch(
      (err) =>
        logger.error({
          message: "Redis cache failed",
          tracebackId,
          error: err,
        }),
    );

    return res.redirect(row.original_url);
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

export { getResource };
