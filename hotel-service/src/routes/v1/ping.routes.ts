import express from "express";
import { healthHandler, pingHandler } from "../../controllers/ping.controller";

const pingRouter = express.Router();

pingRouter.get("/", pingHandler);

pingRouter.get("/health", healthHandler);

export default pingRouter;
