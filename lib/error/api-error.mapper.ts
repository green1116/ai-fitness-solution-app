/**
 * V59.5 — Unified API error structure
 */

import { SaasAuthError } from "@/lib/auth/auth.service";
import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { RateLimitError } from "@/lib/security/rate-limit";
import { TenantIsolationError } from "@/lib/tenancy/tenant.guard";
import { IdempotencyConflictError } from "@/lib/security/api-protection";

export interface ApiError {
  code: string;
  message: string;
  status: number;
  traceId: string;
}

export function mapErrorToApiError(err: unknown, traceId: string): ApiError {
  if (err instanceof SaasAuthError) {
    return { code: err.code, message: err.message, status: 401, traceId };
  }
  if (err instanceof FeatureGateError) {
    return { code: err.code, message: err.message, status: 403, traceId };
  }
  if (err instanceof TenantIsolationError) {
    return { code: err.code, message: err.message, status: 403, traceId };
  }
  if (err instanceof RateLimitError) {
    return { code: err.code, message: err.message, status: 429, traceId };
  }
  if (err instanceof IdempotencyConflictError) {
    return { code: err.code, message: err.message, status: 409, traceId };
  }
  if (err instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: err.message || "Internal server error",
      status: 500,
      traceId,
    };
  }
  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    status: 500,
    traceId,
  };
}

export function isKnownApiError(err: unknown): boolean {
  return (
    err instanceof SaasAuthError ||
    err instanceof FeatureGateError ||
    err instanceof TenantIsolationError ||
    err instanceof RateLimitError ||
    (err instanceof Error && err.name === "IdempotencyConflictError")
  );
}
