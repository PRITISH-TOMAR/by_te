import { HealthStatus } from "./health_types";

export class HealthResponseDTO {
  server: HealthStatus;
  database: HealthStatus;
  redis: HealthStatus;

  constructor({
    server,
    database,
    redis,
  }: {
    server: HealthStatus;
    database: HealthStatus;
    redis: HealthStatus;
  }) {
    this.server = server;
    this.database = database;
    this.redis = redis;
  }
}
