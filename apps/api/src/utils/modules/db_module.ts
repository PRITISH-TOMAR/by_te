import pool from "../../config/mysql";
import BatchQueries from "../../queries/batch_queries";
import logger from "../../config/logger";
import { PoolConnection } from "mysql2/promise";

export const withTransaction = async <T>(
  fn: (connection: PoolConnection) => Promise<T>,
  onRollback?: () => Promise<void>,
): Promise<T> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    if (onRollback) {
      await onRollback().catch((compensateErr) =>
        logger.error({ message: "Rollback compensation failed", error: compensateErr }),
      );
    }
    throw err;
  } finally {
    connection.release();
  }
};

export const claimNextFromDB = async (): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.query(
      BatchQueries.GET_COUNTER_FROM_DB,
    );

    const current = rows[0]?.counter ?? 0;
    const next = current + 1;

    await connection.query(BatchQueries.UPDATE_COUNTER_IN_DB, [next]);

    await connection.commit();
    return next;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const getCounterFromDB = async (): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.query(
      BatchQueries.GET_COUNTER_FROM_DB,
    );

    const counter = rows[0]?.counter ?? 0;

    await connection.commit();
    return counter;
  } catch (err) {
    await connection.rollback();
    logger.error({
      message: "Failed to fetch counter from DB",
    });
    return 0;
  } finally {
    connection.release();
  }
};

export const syncCounterToDB = async (counter: number): Promise<void> => {
  await pool.query(BatchQueries.UPSERT_COUNTER_IN_DB, [counter]);
};
