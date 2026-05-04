import pool from "../config/mysql";
import ResourceQueries from "../queries/resource_queries";
import { ShortenRequestDTO } from "../dto/request/resources/shorten_request_dto";
import { ShortCodeDBO } from "../dbo/short_code";
import { Pool, PoolConnection } from "mysql2/promise";

const createResourceRepository = (executor: Pool | PoolConnection = pool) => ({
  findByShortCode: async (shortCode: string) => {
    const [rows]: any = await executor.query(ResourceQueries.GET_SHORT_CODE, [
      shortCode,
    ]);
    return rows[0] ?? null;
  },

  findByCustomAlias: async (alias: string) => {
    const [rows]: any = await executor.query(ResourceQueries.GET_SHORT_CODE, [
      alias,
    ]);
    return rows[0] ?? null;
  },

  insertURL: async (
    request: ShortenRequestDTO,
    shortCodeObject: ShortCodeDBO,
  ) => {
    const resourceType: string = request.isQr ? "QR" : "LINK";
    await executor.query(ResourceQueries.CREATE_RESOURCE, [
      shortCodeObject.counterID,
      shortCodeObject.shortCode,
      request.originalUrl,
      resourceType,
      request.activateAt ?? null,
      request.expiresAt ?? null,
    ]);
  },

  findById: async (id: number) => {
    const [rows]: any = await executor.query(
      ResourceQueries.GET_RESOURCE_BY_ID,
      [id],
    );
    return rows[0] ?? null;
  },

  insertQrCodeUrl: async (qrCodeUrl: string, shortCode: string) => {
    await executor.query(ResourceQueries.INSERT_QR_CODE_LINK, [
      shortCode,
      qrCodeUrl,
    ]);
  },
});

const ResourceRepository = createResourceRepository();

export { createResourceRepository };
export default ResourceRepository;
