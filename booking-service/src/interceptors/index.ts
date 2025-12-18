// Server-side interceptors are applied at the handler level using withServerInterceptor
// Client-side interceptors can be added here if needed for outbound calls
export { withServerInterceptor } from "./server.interceptor";
export { handleGrpcError } from "./error.interceptor";

