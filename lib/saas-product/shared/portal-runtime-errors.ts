export const PORTAL_RUNTIME_ERROR_CODES = {
  PORTAL_CONTEXT_INVALID: "PORTAL_CONTEXT_INVALID",
  PORTAL_WORKSPACE_REQUIRED: "PORTAL_WORKSPACE_REQUIRED",
  PORTAL_PRODUCT_NOT_FOUND: "PORTAL_PRODUCT_NOT_FOUND",
  PORTAL_WORKFLOW_NOT_FOUND: "PORTAL_WORKFLOW_NOT_FOUND",
  PORTAL_ROUTE_INVALID: "PORTAL_ROUTE_INVALID",
} as const;

export type PortalRuntimeErrorCode =
  (typeof PORTAL_RUNTIME_ERROR_CODES)[keyof typeof PORTAL_RUNTIME_ERROR_CODES];

export class SaasPortalRuntimeError extends Error {
  readonly code: PortalRuntimeErrorCode;

  constructor(code: PortalRuntimeErrorCode, message: string) {
    super(message);
    this.name = "SaasPortalRuntimeError";
    this.code = code;
  }
}

export function isSaasPortalRuntimeError(error: unknown): error is SaasPortalRuntimeError {
  return error instanceof SaasPortalRuntimeError;
}
