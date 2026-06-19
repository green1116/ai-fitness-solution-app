export const PORTAL_ERROR_CODES = {
  PORTAL_NOT_FOUND: "PORTAL_NOT_FOUND",
  PORTAL_ACCESS_DENIED: "PORTAL_ACCESS_DENIED",
  PORTAL_NAVIGATION_DENIED: "PORTAL_NAVIGATION_DENIED",
} as const;

export type PortalErrorCode = (typeof PORTAL_ERROR_CODES)[keyof typeof PORTAL_ERROR_CODES];

export class SaasPortalError extends Error {
  readonly code: PortalErrorCode;

  constructor(code: PortalErrorCode, message: string) {
    super(message);
    this.name = "SaasPortalError";
    this.code = code;
  }
}

export function isSaasPortalError(error: unknown): error is SaasPortalError {
  return error instanceof SaasPortalError;
}
