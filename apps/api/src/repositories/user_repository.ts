import { ResultSetHeader } from "mysql2";
import pool from "../config/mysql";
import UserQueries from "../queries/user_queries";

export type UserRow = {
  id: number;
  email: string;
  password_hash: Buffer;
  password_salt: Buffer;
  plan_type: "FREE" | "PRO";
  is_active: boolean | number;
  is_email_verified: boolean | number;
  created_at: Date;
  updated_at: Date;
};

const UserRepository = {
  findByEmail: async (email: string): Promise<UserRow | null> => {
    const [rows]: any = await pool.query(UserQueries.GET_USER_BY_EMAIL, [email]);
    return rows[0] ?? null;
  },

  findById: async (id: number): Promise<UserRow | null> => {
    const [rows]: any = await pool.query(UserQueries.GET_USER_BY_ID, [id]);
    return rows[0] ?? null;
  },

  createUser: async ({
    email,
    passwordHash,
    passwordSalt,
  }: {
    email: string;
    passwordHash: Buffer;
    passwordSalt: Buffer;
  }): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(UserQueries.CREATE_USER, [
      email,
      passwordHash,
      passwordSalt,
    ]);

    return result.insertId;
  },
};

export default UserRepository;
