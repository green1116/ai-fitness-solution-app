export const WORKSPACE_RUNTIME_ERROR_CODES = {
  WORKSPACE_PRODUCT_NOT_FOUND: "WORKSPACE_PRODUCT_NOT_FOUND",
  WORKSPACE_PRODUCT_CONTEXT_INVALID: "WORKSPACE_PRODUCT_CONTEXT_INVALID",
  WORKSPACE_PRODUCT_TENANT_MISMATCH: "WORKSPACE_PRODUCT_TENANT_MISMATCH",
  WORKSPACE_PRODUCT_ALREADY_EXISTS: "WORKSPACE_PRODUCT_ALREADY_EXISTS",
  WORKSPACE_PRODUCT_STATUS_INVALID: "WORKSPACE_PRODUCT_STATUS_INVALID",
  WORKSPACE_PRODUCT_MAPPING_INVALID: "WORKSPACE_PRODUCT_MAPPING_INVALID",
} as const;

export type WorkspaceRuntimeErrorCode =
  (typeof WORKSPACE_RUNTIME_ERROR_CODES)[keyof typeof WORKSPACE_RUNTIME_ERROR_CODES];

export class SaasWorkspaceProductError extends Error {
  readonly code: WorkspaceRuntimeErrorCode;

  constructor(code: WorkspaceRuntimeErrorCode, message: string) {
    super(message);
    this.name = "SaasWorkspaceProductError";
    this.code = code;
  }
}

export function isSaasWorkspaceProductError(error: unknown): error is SaasWorkspaceProductError {
  return error instanceof SaasWorkspaceProductError;
}
