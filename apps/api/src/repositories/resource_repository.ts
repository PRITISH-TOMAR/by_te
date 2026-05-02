import pool from "../config/mysql";
import ResourceQueries from "../queries/resource_queries";
import { ShortenRequestDTO } from "../dto/request/resources/shorten_request_dto";
import { ShortCodeDBO } from "../dbo/short_code";

const findByShortCode = async (shortCode: string) => {
  const [rows]: any = await pool.query(ResourceQueries.GET_SHORT_CODE, [
    shortCode,
  ]);
  return rows[0] ?? null;
};

const findByCustomAlias = async (alias: string) => {
  return findByShortCode(alias);
};

const insertURL = async (
  request: ShortenRequestDTO,
  shortCodeObject: ShortCodeDBO,
) => {
  const resourceType: string = request.isQr ? "QR" : "LINK";
  await pool.query(ResourceQueries.CREATE_RESOURCE, [
    shortCodeObject.counterID,
    shortCodeObject.shortCode,
    request.originalUrl,
    resourceType,
    request.activateAt ?? null,
    request.expiresAt ?? null,
  ]);
};

const findById = async (id: number) => {
  const [rows]: any = await pool.query(ResourceQueries.GET_RESOURCE_BY_ID, [
    id,
  ]);
  return rows[0] ?? null;
};

const ResourceRepository = {
  findByShortCode,
  findByCustomAlias,
  insertURL,
  findById,
};

export default ResourceRepository;
