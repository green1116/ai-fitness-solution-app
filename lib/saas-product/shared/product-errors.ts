export const PRODUCT_ERROR_CODES = {
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  WORKFLOW_STAGE_NOT_FOUND: "WORKFLOW_STAGE_NOT_FOUND",
  WORKSPACE_PRODUCT_NOT_FOUND: "WORKSPACE_PRODUCT_NOT_FOUND",
  V47_MODULE_NOT_MAPPED: "V47_MODULE_NOT_MAPPED",
  INVALID_WORKSPACE_PRODUCT_BINDING: "INVALID_WORKSPACE_PRODUCT_BINDING",
} as const;

export type ProductErrorCode = (typeof PRODUCT_ERROR_CODES)[keyof typeof PRODUCT_ERROR_CODES];

export class SaasProductError extends Error {
  readonly code: ProductErrorCode;

  constructor(code: ProductErrorCode, message: string) {
    super(message);
    this.name = "SaasProductError";
    this.code = code;
  }
}

export function isSaasProductError(error: unknown): error is SaasProductError {
  return error instanceof SaasProductError;
}
