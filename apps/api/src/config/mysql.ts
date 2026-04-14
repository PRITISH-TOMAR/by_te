import mysql, { Pool } from "mysql2/promise";

// optional: validate env early
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_NAME) {
  throw new Error("Missing required DB environment variables");
}

const pool: Pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT), 
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;