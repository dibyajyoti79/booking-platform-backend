import * as grpc from "@grpc/grpc-js";
import logger from "../config/logger.config";
import { ServiceConfig } from "../config/service-registry";
import { loadProto } from "./proto-loader";

/**
 * Service Loader
 * Industry standard: Auto-discovery and registration of gRPC services
 *
 * This utility automatically loads proto files and registers handlers,
 * making it easy to add new services without modifying server code.
 */
export class ServiceLoader {
  /**
   * Load service from proto file and return service definition
   */
  private static loadServiceDefinition(
    protoFile: string,
    packagePath: string
  ): any | null {
    try {
      const proto = loadProto(protoFile);
      const packageDef = grpc.loadPackageDefinition(proto) as any;

      // Navigate through package hierarchy (e.g., "booking.v1.HealthService")
      const parts = packagePath.split(".");
      let service = packageDef;

      for (const part of parts) {
        if (service && service[part]) {
          service = service[part];
        } else {
          logger.error(
            `Service path not found: ${packagePath} in ${protoFile}`
          );
          return null;
        }
      }

      return service;
    } catch (error) {
      logger.error(`Failed to load proto file ${protoFile}:`, error);
      return null;
    }
  }

  /**
   * Register a single service
   */
  static registerService(server: grpc.Server, config: ServiceConfig): boolean {
    const serviceDef = this.loadServiceDefinition(
      config.protoFile,
      config.packagePath
    );

    if (!serviceDef?.service) {
      logger.error(
        `Failed to load service definition for ${config.serviceName}`
      );
      return false;
    }

    try {
      server.addService(serviceDef.service, config.handlers);
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
