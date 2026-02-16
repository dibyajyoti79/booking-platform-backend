import dotenv from "dotenv";
import logger from "./logger.config";

type ServerConfig = {
  PORT: number;
  ENV: string;
  REDIS_SERVER_URL: string;
  LOCK_TTL: number;
  HOTEL_SERVICE_URL: string;
};

function loadEnv() {
  dotenv.config();
  logger.info("Loaded environment variables from .env file");
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  ENV: process.env.NODE_ENV || "development",
  REDIS_SERVER_URL: process.env.REDIS_SERVER_URL || "redis://localhost:6379",
  LOCK_TTL: Number(process.env.LOCK_TTL) || 60000,
  HOTEL_SERVICE_URL:
    process.env.HOTEL_SERVICE_URL || "http://localhost:3000",
};
