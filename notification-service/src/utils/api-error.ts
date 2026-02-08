import { StatusCodes } from "http-status-codes";

class ApiError extends Error {
  public statusCode: number;
  public error: unknown;

  constructor(statusCode: number, message: string, error: unknown = null) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.error = error;
    Error.captureStackTrace(this, new.target);
  }
}

class BadRequestError extends ApiError {
  constructor(message = "Bad Request", error: unknown = null) {
    super(StatusCodes.BAD_REQUEST, message, error);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Not Found", error: unknown = null) {
    super(StatusCodes.NOT_FOUND, message, error);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", error: unknown = null) {
    super(StatusCodes.UNAUTHORIZED, message, error);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", error: unknown = null) {
    super(StatusCodes.FORBIDDEN, message, error);
  }
}

class ConflictError extends ApiError {
  constructor(message = "Conflict", error: unknown = null) {
    super(StatusCodes.CONFLICT, message, error);
  }
}

class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error", error: unknown = null) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, error);
  }
}

export {
  ApiError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
};
