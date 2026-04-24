export class ShortenedURLDTO {
  originalUrl: string;
  shortenedUrl: string;
  expiresAt?: string;
  customAlias?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    originalUrl,
    shortenedUrl,
    expiresAt,
    customAlias,
    password,
    createdAt,
    updatedAt,
  }: {
    originalUrl: string;
    shortenedUrl: string;
    expiresAt?: string;
    customAlias?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.originalUrl = originalUrl;
    this.shortenedUrl = shortenedUrl;
    this.expiresAt = expiresAt;
    this.customAlias = customAlias;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
