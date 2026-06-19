export const SAAS_CONTEXT_ERROR_CODES = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  INVALID_SESSION: "INVALID_SESSION",
  TENANT_CONTEXT_NOT_FOUND: "TENANT_CONTEXT_NOT_FOUND",
} as const;

export type SaasContextErrorCode = (typeof SAAS_CONTEXT_ERROR_CODES)[keyof typeof SAAS_CONTEXT_ERROR_CODES];

export class SaasContextError extends Error {
  readonly code: SaasContextErrorCode;

  constructor(code: SaasContextErrorCode, message: string) {
    super(message);
    this.name = "SaasContextError";
    this.code = code;
  }
}

export function isSaasContextError(error: unknown): error is SaasContextError {
  return error instanceof SaasContextError;
}
