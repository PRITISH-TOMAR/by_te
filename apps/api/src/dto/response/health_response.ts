import { HealthStatus } from "./health_types";

export class HealthResponseDTO {
  status: HealthStatus;
  server: HealthStatus;
  database: HealthStatus;
  redis: HealthStatus;

  constructor({
    status,
    server,
    database,
    redis,
  }: {
    status: HealthStatus;
    server: HealthStatus;
    database: HealthStatus;
    redis: HealthStatus;
  }) {
    this.status = status;
    this.server = server;
    this.database = database;
    this.redis = redis;
  }
}