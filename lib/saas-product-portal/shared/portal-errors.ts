export const PORTAL_ERROR_CODES = {
  PORTAL_API_ERROR: "PORTAL_API_ERROR",
  PORTAL_UNAUTHORIZED: "PORTAL_UNAUTHORIZED",
  PORTAL_SESSION_REQUIRED: "PORTAL_SESSION_REQUIRED",
} as const;

export type PortalErrorCode = (typeof PORTAL_ERROR_CODES)[keyof typeof PORTAL_ERROR_CODES];

export class SaasProductPortalError extends Error {
  readonly code: PortalErrorCode;
  readonly status: number;

  constructor(code: PortalErrorCode, message: string, status = 400) {
    super(message);
    this.name = "SaasProductPortalError";
    this.code = code;
    this.status = status;
  }
}

export function isSaasProductPortalError(error: unknown): error is SaasProductPortalError {
  return error instanceof SaasProductPortalError;
}
