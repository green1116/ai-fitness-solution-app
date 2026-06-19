import { RBAC_ERROR_CODES, type RbacErrorCode } from "./rbac-types";

export class SaasRbacError extends Error {
  readonly code: RbacErrorCode;

  constructor(code: RbacErrorCode, message: string) {
    super(message);
    this.name = "SaasRbacError";
    this.code = code;
  }
}

export function isSaasRbacError(error: unknown): error is SaasRbacError {
  return error instanceof SaasRbacError;
}

export { RBAC_ERROR_CODES };
