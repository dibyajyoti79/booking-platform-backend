import * as grpc from "@grpc/grpc-js";
import { v4 as uuidV4 } from "uuid";
import { asyncLocalStorage } from "../utils/helpers/request.helpers";

/**
 * Server-side interceptor to extract correlation ID from metadata
 * Industry standard: Extract tracing/correlation IDs from gRPC metadata
 */
export function serverInterceptor(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>,
  handler: grpc.handleUnaryCall<any, any>
): void {
  // Extract correlation ID from metadata or generate a new one
  const correlationId =
    call.metadata.get("x-correlation-id")[0]?.toString() || uuidV4();

  // Store in async local storage for the duration of the request
  asyncLocalStorage.run({ correlationId }, () => {
    handler(call, callback);
  });
}

/**
 * Wrapper to create server interceptors for all handlers
 */
export function withServerInterceptor<TRequest, TResponse>(
  handler: grpc.handleUnaryCall<TRequest, TResponse>
): grpc.handleUnaryCall<TRequest, TResponse> {
  return (call: grpc.ServerUnaryCall<TRequest, TResponse>, callback: grpc.sendUnaryData<TResponse>) => {
    serverInterceptor(call, callback, handler);
  };
}

