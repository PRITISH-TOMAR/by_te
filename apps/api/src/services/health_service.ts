import { HealthResponseDTO } from "../dto/response/health_response";
import * as healthRepo from "../repositories/health_repository";

export const checkHealth = async (): Promise<HealthResponseDTO> => {
  const [server, database, redis] = await Promise.all([
    Promise.resolve(healthRepo.checkServer()),
    healthRepo.checkMySQL(),
    healthRepo.checkRedis(),
  ]);

  let status: HealthResponseDTO["status"] = "UP";

  if (database === "DOWN" && redis === "DOWN") {
    status = "DOWN";
  } else if (database === "DOWN" || redis === "DOWN") {
    status = "DEGRADED";
  }

  return { status, server, database, redis };
};