import { Request, Response } from "express";
import logger from "../config/logger.config";
import quicker from "../utils/quicker";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";

export const pingHandler = (req: Request, res: Response): void => {
  logger.info("Ping request received");
  res.status(200).json(new ApiResponse("Pong!"));
};

export const healthHandler = (req: Request, res: Response): void => {
  logger.info("Health request received");
  const healthData = {
    application: quicker.getApplicationHealth(),
    system: quicker.getSystemHealth(),
    timestamp: Date.now(),
  };
  res.status(StatusCodes.OK).json(new ApiResponse("Ok", healthData));
};
