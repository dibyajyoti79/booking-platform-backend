import dotenv from "dotenv";
import logger from "./logger.config";

type ServerConfig = {
  PORT: number;
  ENV: string;
};

type DatabaseConfig = {
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  DB_HOST: string;
  DATABASE_URL: string;
};

function loadEnv() {
  dotenv.config();
  const dbUser = process.env.DB_USER || "root";
  const dbPass = process.env.DB_PASS || "root";
  const dbName = process.env.DB_NAME || "hotel-dev";
  const dbHost = process.env.DB_HOST || "127.0.0.1";
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${dbUser}:${encodeURIComponent(dbPass)}@${dbHost}:3306/${dbName}`;
  }
  logger.info("Loaded environment variables from .env file");
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  ENV: process.env.NODE_ENV || "development",
};

export const dbConfig: DatabaseConfig = {
  DB_USER: process.env.DB_USER || "root",
  DB_PASS: process.env.DB_PASS || "root",
  DB_NAME: process.env.DB_NAME || "hotel-dev",
  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DATABASE_URL: process.env.DATABASE_URL!,
};
