export class ShortenRequestDTO {
  userId?: number;
  originalUrl: string;
  resourceType?: "LINK" | "QR";
  activateAt?: Date;
  expiresAt?: Date;
  customAlias?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    userId,
    originalUrl,
    resourceType,
    activateAt,
    expiresAt,
    customAlias,
    password,
    createdAt,
    updatedAt,
  }: {
    userId?: number;
    originalUrl: string;
    resourceType?: "LINK" | "QR";
    activateAt?: Date;
    expiresAt?: Date;
    customAlias?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.userId = userId;
    this.originalUrl = originalUrl;
    this.resourceType = resourceType;
    this.activateAt = activateAt;
    this.expiresAt = expiresAt;
    this.customAlias = customAlias;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
