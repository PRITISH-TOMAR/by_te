import crypto from "crypto";
import { constants } from "../constants/constants";

export const generateShortCode = (): String => {
  const bytes = crypto.randomBytes(constants.CODE_LENGTH);
  const charset = constants.CHARSET;
  return Array.from(bytes)
    .map((byte) => charset[byte % charset.length])
    .join("");
};
