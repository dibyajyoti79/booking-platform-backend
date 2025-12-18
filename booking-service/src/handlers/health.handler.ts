import * as grpc from "@grpc/grpc-js";
import logger from "../config/logger.config";
import { getCorrelationId } from "../utils/helpers/request.helpers";
import { withServerInterceptor } from "../interceptors/server.interceptor";
import { HealthService } from "../services/health.service";

// Type definitions for health service
interface HealthServiceHandlers extends grpc.UntypedServiceImplementation {
  Ping: grpc.handleUnaryCall<any, any>;
  HealthCheck: grpc.handleUnaryCall<any, any>;
}

// Initialize service
const healthService = new HealthService();

/**
 * Ping handler - simple connectivity check
 */
const pingHandler: HealthServiceHandlers["Ping"] = (call, callback) => {
  logger.info({
    correlationId: getCorrelationId(),
    method: "Ping",
  });

  callback(null, {
    message: "Pong!",
  });
};

/**
 * Health check handler - detailed system and application health
 */
const healthCheckHandler: HealthServiceHandlers["HealthCheck"] = (
  call,
  callback
) => {
  logger.info({
    correlationId: getCorrelationId(),
    method: "HealthCheck",
  });

  const healthData = healthService.getHealth();

  callback(null, {
    status: "Ok",
    data: {
      application: {
        environment: healthData.application.environment,
        uptime: healthData.application.uptime,
        memory_usage: {
          heap_total: healthData.application.memoryUsage.heapTotal,
          heap_used: healthData.application.memoryUsage.heapUsed,
        },
      },
      system: {
        cpu_usage: healthData.system.cpuUsage,
        total_memory: healthData.system.totalMemory,
        free_memory: healthData.system.freeMemory,
      },
    },
    timestamp: Date.now(),
  });
};

// Apply server interceptor to all handlers
export const healthHandlers: HealthServiceHandlers = {
  Ping: withServerInterceptor(pingHandler),
  HealthCheck: withServerInterceptor(healthCheckHandler),
};
