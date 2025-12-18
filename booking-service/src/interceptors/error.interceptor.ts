import * as grpc from "@grpc/grpc-js";
import logger from "../config/logger.config";
import { ApiError } from "../utils/api-error";
import { ZodError } from "zod";
import { getCorrelationId } from "../utils/helpers/request.helpers";

/**
 * gRPC interceptor for centralized error handling
 * Industry standard: Convert application errors to gRPC status codes
 */
export const errorInterceptor = (
  options: any,
  nextCall: any
): grpc.InterceptingCall => {
  const requester = {
    start: (metadata: grpc.Metadata, listener: grpc.Listener, next: any) => {
      const newListener = {
        onReceiveStatus: (
          status: grpc.StatusObject,
          next: (status: grpc.StatusObject) => void
        ) => {
          // Log errors with correlation ID
          if (status.code !== grpc.status.OK) {
            logger.error({
              correlationId: getCorrelationId(),
              code: status.code,
              details: status.details,
              metadata: status.metadata,
            });
          }
          // Call the next listener in the chain
          if (listener.onReceiveStatus) {
            listener.onReceiveStatus(status, next);
          } else {
            // If no listener, just call next to continue the chain
            next(status);
          }
        },
        onReceiveMessage: listener.onReceiveMessage,
        onReceiveMetadata: listener.onReceiveMetadata,
      };

      next(metadata, newListener);
    },
  };

  return new grpc.InterceptingCall(nextCall(options), requester);
};

/**
 * Helper function to convert application errors to gRPC status
 */
export function handleGrpcError(error: unknown): grpc.ServiceError {
  const correlationId = getCorrelationId();

  // Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    logger.error({
      correlationId,
      error: "Validation error",
      details,
    });

    return {
      code: grpc.status.INVALID_ARGUMENT,
      message: "Validation failed",
      details: JSON.stringify({ code: "ZOD_VALIDATION_ERROR", details }),
      name: "ValidationError",
      metadata: new grpc.Metadata(),
    };
  }

  // Custom API errors
  if (error instanceof ApiError) {
    logger.error({
      correlationId,
      error: error.message,
      statusCode: error.statusCode,
    });

    // Map HTTP status codes to gRPC status codes
    let grpcCode: grpc.status;
    switch (error.statusCode) {
      case 400:
        grpcCode = grpc.status.INVALID_ARGUMENT;
        break;
      case 401:
        grpcCode = grpc.status.UNAUTHENTICATED;
        break;
      case 403:
        grpcCode = grpc.status.PERMISSION_DENIED;
        break;
      case 404:
        grpcCode = grpc.status.NOT_FOUND;
        break;
      case 409:
        grpcCode = grpc.status.ALREADY_EXISTS;
        break;
      case 429:
        grpcCode = grpc.status.RESOURCE_EXHAUSTED;
        break;
      case 500:
        grpcCode = grpc.status.INTERNAL;
        break;
      case 503:
        grpcCode = grpc.status.UNAVAILABLE;
        break;
      default:
        grpcCode = grpc.status.INTERNAL;
    }

    return {
      code: grpcCode,
      message: error.message,
      details: JSON.stringify({ code: error.name, details: error.error }),
      name: error.name,
      metadata: new grpc.Metadata(),
    };
  }

  // Unknown errors
  logger.error({
    correlationId,
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  });

  return {
    code: grpc.status.INTERNAL,
    message: "Internal server error",
    details: JSON.stringify({ code: "INTERNAL_SERVER_ERROR" }),
    name: "InternalError",
    metadata: new grpc.Metadata(),
  };
}
