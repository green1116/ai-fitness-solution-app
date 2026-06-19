export const API_ERROR_CODES = {
  API_INTERNAL_ERROR: "API_INTERNAL_ERROR",
  API_UNAUTHORIZED: "API_UNAUTHORIZED",
  API_TENANT_REQUIRED: "API_TENANT_REQUIRED",
  API_VALIDATION_FAILED: "API_VALIDATION_FAILED",
  API_NOT_FOUND: "API_NOT_FOUND",
  API_CONFLICT: "API_CONFLICT",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export class SaasProductApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message);
    this.name = "SaasProductApiError";
    this.code = code;
    this.status = status;
  }
}

export function isSaasProductApiError(error: unknown): error is SaasProductApiError {
  return error instanceof SaasProductApiError;
}

export function apiUnauthorized(message = "Unauthorized"): SaasProductApiError {
  return new SaasProductApiError(API_ERROR_CODES.API_UNAUTHORIZED, message, 401);
}

export function apiTenantRequired(message = "tenantId is required"): SaasProductApiError {
  return new SaasProductApiError(API_ERROR_CODES.API_TENANT_REQUIRED, message, 401);
}

export function apiNotFound(message = "Not found"): SaasProductApiError {
  return new SaasProductApiError(API_ERROR_CODES.API_NOT_FOUND, message, 404);
}

export function apiValidationFailed(message: string): SaasProductApiError {
  return new SaasProductApiError(API_ERROR_CODES.API_VALIDATION_FAILED, message, 400);
}
