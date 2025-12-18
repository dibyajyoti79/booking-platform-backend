import * as grpc from "@grpc/grpc-js";
import { bookingHandlers } from "../handlers/booking.handler";
import { BookingServiceService } from "../proto/generated/booking";

/**
 * Service configuration interface
 * Industry standard: Use generated service definitions (no runtime proto loading)
 */
export interface ServiceConfig {
  serviceDefinition: grpc.ServiceDefinition<any>; // Generated service definition
  handlers: grpc.UntypedServiceImplementation;
  serviceName: string; // For logging
}

/**
 * Service Registry
 * Industry standard: Use generated service definitions directly
 *
 * Benefits:
 * - No runtime proto file loading
 * - Better type safety
 * - No proto files needed in production
 * - Faster startup time
 *
 * To add a new service:
 * 1. Create proto file in src/proto/
 * 2. Run `npm run proto:generate` to generate types
 * 3. Create handlers in src/handlers/
 * 4. Import generated service definition and add entry here
 *
 * Example:
 * {
 *   serviceDefinition: PaymentServiceService,
 *   handlers: paymentHandlers,
 *   serviceName: "PaymentService",
 * }
 */
export const SERVICE_REGISTRY: ServiceConfig[] = [
  {
    serviceDefinition: BookingServiceService,
    handlers: bookingHandlers,
    serviceName: "BookingService",
  },
];
