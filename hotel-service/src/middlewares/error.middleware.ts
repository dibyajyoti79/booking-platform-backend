import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error";
import { ZodError } from "zod";

export const appErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  // Zod validation error
  if (err instanceof ZodError) {
    const details = err.errors.map((e: import("zod").ZodIssue) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      error: { code: "ZOD_VALIDATION_ERROR", details },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.name,
        details: err.error,
      },
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
    error: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
  return;
};
