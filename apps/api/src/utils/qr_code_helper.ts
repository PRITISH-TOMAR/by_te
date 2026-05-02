import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";
import { constants } from "../constants/constants";
import QRCode from "qrcode";
import { getUTCDateString } from "./resource_helper";
import "dotenv/config";
const { S3_BASE_URL } = process.env;

const uploadQR = async (buffer: Buffer, shortCode: string) => {
  const key = `${shortCode}_${getUTCDateString()}.png`;

  await s3.send(
    new PutObjectCommand({
      Bucket: constants.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    }),
  );

  return key;
};

export const getQRUrl = (key: string): string => {
  return `${S3_BASE_URL}/${constants.S3_BUCKET}/${key}`;
};

const generateQRCodeURL = async (originalUrl: string, shortCode: string) => {
  const qrBuffer = await QRCode.toBuffer(originalUrl);
  const key = await uploadQR(qrBuffer, shortCode);

  return getQRUrl(key);
};

export const QrCodeHelper = {generateQRCodeURL};