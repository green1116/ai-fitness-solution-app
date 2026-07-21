/**
 * E10-P5 — Platform API Gateway constants
 * BASE: enterprise-e10-p4-platform-event-v1
 */

export const E10_GATEWAY_ID =
  "enterprise-e10-platform-gateway-v1" as const;

export const E10_GATEWAY_VERSION = "e10-gateway-1" as const;
export const E10_GATEWAY_FREEZE_VERSION =
  "e10-gateway-freeze-1" as const;

export const E10_GATEWAY_BASE =
  "enterprise-e10-p4-platform-event-v1" as const;

export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

export const ROUTE_STATUSES = [
  "ACTIVE",
  "DISABLED",
  "REMOVED",
] as const;

export const MIDDLEWARE_KINDS = [
  "AUTH",
  "VALIDATE",
  "TRANSFORM",
  "LOGGING",
  "CUSTOM",
] as const;

export const GATEWAY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export const DISPATCH_RESULT_STATUSES = [
  "OK",
  "NOT_FOUND",
  "FORBIDDEN",
  "ERROR",
] as const;
