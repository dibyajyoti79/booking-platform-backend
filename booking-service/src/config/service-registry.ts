import * as grpc from "@grpc/grpc-js";
import { healthHandlers } from "../handlers/health.handler";
import { bookingHandlers } from "../handlers/booking.handler";

/**
 * Service configuration interface
 * Industry standard: Configuration-driven service registration
 */
export interface ServiceConfig {
  protoFile: string;
  packagePath: string; // e.g., "booking.v1.HealthService"
  handlers: grpc.UntypedServiceImplementation;
  serviceName: string; // For logging
}

/**
 * Service Registry
 * Industry standard: Centralized service configuration for auto-registration
 *
 * To add a new service:
 * 1. Create proto file in src/proto/
 * 2. Create handlers in src/handlers/
 * 3. Add entry to this registry
 *
 * Example:
 * {
 *   protoFile: "payment.proto",
 *   packagePath: "booking.v1.PaymentService",
 *   handlers: paymentHandlers,
 *   serviceName: "PaymentService",
 * }
 */
export const SERVICE_REGISTRY: ServiceConfig[] = [
  {
    protoFile: "health.proto",
    packagePath: "booking.v1.HealthService",
    handlers: healthHandlers,
    serviceName: "HealthService",
  },
  {
    protoFile: "booking.proto",
    packagePath: "booking.v1.BookingService",
    handlers: bookingHandlers,
    serviceName: "BookingService",
  },
];
