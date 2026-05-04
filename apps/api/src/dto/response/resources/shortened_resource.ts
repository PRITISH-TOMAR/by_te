export class ShortenedResponseDTO {
  originalUrl: string;
  shortenedUrl: string;
  expiresAt?: Date;
  customAlias?: string;
  qrCodeUrl?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    originalUrl,
    shortenedUrl,
    expiresAt,
    customAlias,
    qrCodeUrl,
    password,
    createdAt,
    updatedAt,
  }: {
    originalUrl: string;
    shortenedUrl: string;
    expiresAt?: Date;
    customAlias?: string;
    qrCodeUrl?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.originalUrl = originalUrl;
    this.shortenedUrl = shortenedUrl;
    this.expiresAt = expiresAt;
    this.customAlias = customAlias;
    this.qrCodeUrl = qrCodeUrl;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
