import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

const PASSWORD_KEY_LENGTH = 64;

export type AuthTokenPayload = {
  userId: number;
  email: string;
};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing required JWT_SECRET environment variable");
  }

  return secret;
};

export const hashPassword = async (
  password: string,
): Promise<{ passwordHash: Buffer; passwordSalt: Buffer }> => {
  const passwordSalt = crypto.randomBytes(16);

  const passwordHash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, passwordSalt, PASSWORD_KEY_LENGTH, (err, key) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(key as Buffer);
    });
  });

  return { passwordHash, passwordSalt };
};

export const verifyPassword = async ({
  password,
  passwordHash,
  passwordSalt,
}: {
  password: string;
  passwordHash: Buffer;
  passwordSalt: Buffer;
}): Promise<boolean> => {
  const candidateHash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, passwordSalt, PASSWORD_KEY_LENGTH, (err, key) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(key as Buffer);
    });
  });

  return crypto.timingSafeEqual(candidateHash, passwordHash);
};

export const signAuthToken = (payload: AuthTokenPayload): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];

  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
};
