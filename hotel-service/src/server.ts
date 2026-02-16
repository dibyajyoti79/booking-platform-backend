import "./config";
import express from "express";
import { serverConfig } from "./config";
import v1Router from "./routes/v1/index.routes";
import { appErrorHandler } from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { prisma } from "./prisma/client";
import { ensureIndex } from "./elasticsearch/hotel-index";

const app = express();

app.use(express.json());
app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", v1Router);
app.use(appErrorHandler);

(async () => {
  try {
    await ensureIndex();
  } catch (err) {
    logger.warn("Elasticsearch index ensure failed; search may be unavailable", {
      error: err,
    });
  }
})();

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  logger.info(`Press Ctrl+C to stop the server.`);
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", error);
  }
});
