import pool from "../config/mysql";
import {
  CREATE_URL,
  GET_SHORT_CODE,
  GET_CUSTOM_ALIAS,
} from "../queries/resource_queries";
import { ShortenRequestDTO } from "../dto/request/resources/shorten_request_dto";

const findByShortCode = async (shortCode: string) => {
  const [rows]: any = await pool.query(GET_SHORT_CODE, [shortCode]);
  return rows[0] ?? null;
};

const findByCustomAlias = async (alias: string) => {
  const [rows]: any = await pool.query(GET_CUSTOM_ALIAS, [alias]);return rows[0] ?? null;
};

const insertURL = async (
  request: ShortenRequestDTO,
  shortCode: string,
) => {
  const [result]: any = await pool.query(CREATE_URL, [
    request.originalUrl,
    shortCode,
    request.customAlias ?? null,
    request.password    ?? null,
    request.expiresAt   ?? null,  
  ]);
  return result.insertId as number;
};

const ResourceRepository = { findByCustomAlias, findByShortCode, insertURL };

export default ResourceRepository;