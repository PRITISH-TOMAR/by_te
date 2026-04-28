import crypto from "crypto";
import { constants } from "../constants/constants";

// Converts a number to base-65 short code using CHARSET
export const numberToShortCode = (num: number): string => {
  let code = "";
  const charset = constants.CHARSET;

  while (num > 0) {
    code = charset[num % charset.length] + code;
    num  = Math.floor(num / charset.length);
  }
  return code.padStart(constants.CODE_LENGTH, charset[0]);
};

// Random fallback
export const generateShortCode = (): string => {
  const bytes = crypto.randomBytes(constants.CODE_LENGTH);
  const charset = constants.CHARSET;
  return Array.from(bytes)
    .map((byte) => charset[byte % charset.length])
    .join("");
};