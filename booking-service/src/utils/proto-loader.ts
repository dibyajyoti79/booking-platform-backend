import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import fs from "fs";

// Determine proto path: check dist/proto first (production), then src/proto (development)
const getProtoPath = (): string => {
  const distProtoPath = path.join(process.cwd(), "dist/proto");
  const srcProtoPath = path.join(process.cwd(), "src/proto");
  
  // In production, proto files should be copied to dist/proto
  if (fs.existsSync(distProtoPath)) {
    return distProtoPath;
  }
  
  // Fallback to src/proto for development
  return srcProtoPath;
};

const PROTO_PATH = getProtoPath();

/**
 * Load proto file and return package definition
 * Industry standard: Use proto-loader for dynamic proto loading
 */
export function loadProto(protoFile: string): protoLoader.PackageDefinition {
  const protoPath = path.join(PROTO_PATH, protoFile);
  
  return protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
}

/**
 * Get service definition from loaded proto
 * servicePath format: "package.Service" (e.g., "booking.v1.HealthService")
 */
export function getServiceDefinition(
  packageDefinition: protoLoader.PackageDefinition,
  servicePath: string
): any {
  const parts = servicePath.split(".");
  let service: any = grpc.loadPackageDefinition(packageDefinition);
  
  // Navigate through the package hierarchy
  for (const part of parts) {
    if (service && service[part]) {
      service = service[part];
    } else {
      return null;
    }
  }
  
  return service;
}

