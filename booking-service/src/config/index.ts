import dotenv from "dotenv";
import logger from "./logger.config";

type ServerConfig = {
  PORT: number;
  ENV: string;
};

function loadEnv() {
  dotenv.config();
  logger.info("Loaded environment variables from .env file");
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  ENV: process.env.NODE_ENV || "development",
};
