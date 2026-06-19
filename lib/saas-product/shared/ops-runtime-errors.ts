export const OPS_RUNTIME_ERROR_CODES = {
  OPS_CONTEXT_INVALID: "OPS_CONTEXT_INVALID",
  OPS_LIFECYCLE_TRANSITION_DENIED: "OPS_LIFECYCLE_TRANSITION_DENIED",
  OPS_PRODUCT_NOT_FOUND: "OPS_PRODUCT_NOT_FOUND",
} as const;

export type OpsRuntimeErrorCode = (typeof OPS_RUNTIME_ERROR_CODES)[keyof typeof OPS_RUNTIME_ERROR_CODES];

export class SaasOpsRuntimeError extends Error {
  readonly code: OpsRuntimeErrorCode;

  constructor(code: OpsRuntimeErrorCode, message: string) {
    super(message);
    this.name = "SaasOpsRuntimeError";
    this.code = code;
  }
}

export function isSaasOpsRuntimeError(error: unknown): error is SaasOpsRuntimeError {
  return error instanceof SaasOpsRuntimeError;
}
