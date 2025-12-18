import * as grpc from "@grpc/grpc-js";
import logger from "../config/logger.config";
import { ServiceConfig } from "../config/service-registry";

/**
 * Service Loader
 * Industry standard: Use generated service definitions directly
 *
 * Modern approach: No runtime proto loading, uses generated TypeScript types
 * Benefits:
 * - Type-safe service registration
 * - No proto files needed at runtime
 * - Faster startup
 * - Better IDE support
 */
export class ServiceLoader {
  /**
   * Register a single service using generated service definition
   * Industry standard: Direct service definition usage
   */
  static registerService(server: grpc.Server, config: ServiceConfig): boolean {
    if (!config.serviceDefinition) {
      logger.error(
        `Service definition missing for ${config.serviceName}`
      );
      return false;
    }

    try {
      server.addService(config.serviceDefinition, config.handlers);
      logger.info(`✓ ${config.serviceName} registered successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to register ${config.serviceName}:`, error);
      return false;
    }
  }

  /**
   * Register all services from registry
   * Industry standard: Batch registration for scalability
   */
  static registerAllServices(
    server: grpc.Server,
    services: ServiceConfig[]
  ): { registered: number; failed: number } {
    let registered = 0;
    let failed = 0;

    logger.info(`Registering ${services.length} service(s)...`);

    for (const service of services) {
      if (this.registerService(server, service)) {
        registered++;
      } else {
        failed++;
      }
    }

    logger.info(
      `Service registration complete: ${registered} succeeded, ${failed} failed`
    );

    return { registered, failed };
  }
}
