import * as grpc from "@grpc/grpc-js";
import { v4 as uuidV4 } from "uuid";
import { asyncLocalStorage } from "../utils/helpers/request.helpers";

/**
 * gRPC interceptor to attach correlation ID to metadata
 * Industry standard: Use metadata for cross-cutting concerns like tracing
 */
export const correlationInterceptor = (
  options: any,
  nextCall: any
): grpc.InterceptingCall => {
  const correlationId = uuidV4();

  const requester = {
    start: (metadata: grpc.Metadata, listener: grpc.Listener, next: any) => {
      // Add correlation ID to metadata
      metadata.add("x-correlation-id", correlationId);

      // Store in async local storage for logging
      asyncLocalStorage.run({ correlationId }, () => {
        next(metadata, listener);
      });
    },
  };

  return new grpc.InterceptingCall(nextCall(options), requester);
};
