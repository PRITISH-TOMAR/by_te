export class ShortenRequestDTO {
  originalUrl: string;
  expiresAt?: Date;
  customAlias?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    originalUrl,
    expiresAt,
    customAlias,
    password,
    createdAt,
    updatedAt,
  }: {
    originalUrl: string;
    expiresAt?: Date;
    customAlias?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.originalUrl = originalUrl;
    this.expiresAt = expiresAt;
    this.customAlias = customAlias;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
