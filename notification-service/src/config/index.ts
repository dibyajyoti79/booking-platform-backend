import dotenv from "dotenv";
import logger from "./logger.config";

type ServerConfig = {
  PORT: number;
  ENV: string;
  REDIS_PORT?: number;
  REDIS_HOST?: string;
  MAIL_PASS?: string;
  MAIL_USER?: string;
};

function loadEnv() {
  dotenv.config();
  logger.info("Loaded environment variables from .env file");
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  ENV: process.env.NODE_ENV || "development",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  MAIL_PASS: process.env.MAIL_PASS || "",
  MAIL_USER: process.env.MAIL_USER || "",
};
