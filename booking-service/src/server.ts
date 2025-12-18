import * as grpc from "@grpc/grpc-js";
import { serverConfig } from "./config";
import logger from "./config/logger.config";
import { SERVICE_REGISTRY } from "./config/service-registry";
import { ServiceLoader } from "./utils/service-loader";

/**
 * gRPC Server Implementation
 * Industry standard: Use @grpc/grpc-js for Node.js gRPC server
 */
class GrpcServer {
  private server: grpc.Server;

  constructor() {
    // Create gRPC server
    // Server-side interceptors are applied at handler level
    this.server = new grpc.Server();
  }

  /**
   * Register all services from registry
   * Industry standard: Auto-discovery pattern for scalable service registration
   *
   * Services are automatically registered from SERVICE_REGISTRY.
   * To add a new service, simply add it to the registry - no server code changes needed.
   */
  private registerServices(): void {
    const result = ServiceLoader.registerAllServices(
      this.server,
      SERVICE_REGISTRY
    );

    if (result.failed > 0) {
      logger.warn(
        `Some services failed to register. Server may not function correctly.`
      );
    }

    if (result.registered === 0) {
      logger.error("No services registered. Server cannot start.");
      throw new Error("No services registered");
    }
  }

  /**
   * Start the gRPC server
   */
  public start(): void {
    this.registerServices();

    const port = `0.0.0.0:${serverConfig.PORT}`;

    this.server.bindAsync(
      port,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          logger.error(`Failed to start gRPC server: ${error.message}`);
          process.exit(1);
        }

        this.server.start();
        logger.info(`gRPC server is running on ${port}`);
        logger.info(`Press Ctrl+C to stop the server.`);
      }
    );
  }

  /**
   * Graceful shutdown
   */
  public shutdown(): void {
    logger.info("Shutting down gRPC server...");
    this.server.forceShutdown();
    logger.info("gRPC server shut down complete");
  }
}

// Create and start server
const grpcServer = new GrpcServer();
grpcServer.start();

// Graceful shutdown handlers
process.on("SIGINT", () => {
  grpcServer.shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  grpcServer.shutdown();
  process.exit(0);
});
