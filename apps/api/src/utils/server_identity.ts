import os from "os";
import { constants } from "../constants/constants";

// Unique key per server instance based on IP
export const getServerIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface ?? []) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return constants.DEFAULT_IP;
};

export const getServerBatchKey  = (): string => `batch:server:${getServerIP()}`;
export const getGlobalCounterKey = (): string => `batch:global:counter`;