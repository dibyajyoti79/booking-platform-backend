import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import logger from "../config/logger.config";

export const validateRequestBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Validating request body");
      req.body = await schema.parseAsync(req.body);
      logger.info("Request body is valid");
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQueryParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Validating query params");
      req.query = await schema.parseAsync(req.query);
      logger.info("Query params are valid");
      next();
    } catch (error) {
      next(error);
    }
  };
};
