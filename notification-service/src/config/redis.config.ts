import Redis from "ioredis";
import { serverConfig } from ".";

function connectToRedis() {
  try {
    let connection: Redis;

    const redisConfig = {
      port: serverConfig.REDIS_PORT,
      host: serverConfig.REDIS_HOST,
      maxRetriesPerRequest: null,
    };

    return () => {
      if (!connection) {
        connection = new Redis(redisConfig);

        connection.on("connect", () => {
          console.log("Redis connected");
        });

        connection.on("error", (err) => {
          console.error("Redis error:", err);
        });

        return connection;
      }

      return connection;
    };
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    throw error;
  }
}

export const getRedisConnObject = connectToRedis();
