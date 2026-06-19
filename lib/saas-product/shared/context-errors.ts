export const CONTEXT_ERROR_CODES = {
  PRODUCT_CONTEXT_INVALID: "PRODUCT_CONTEXT_INVALID",
  PRODUCT_CONTEXT_TENANT_INVALID: "PRODUCT_CONTEXT_TENANT_INVALID",
  PRODUCT_CONTEXT_WORKSPACE_REQUIRED: "PRODUCT_CONTEXT_WORKSPACE_REQUIRED",
  PRODUCT_CONTEXT_PORTAL_INCOMPATIBLE: "PRODUCT_CONTEXT_PORTAL_INCOMPATIBLE",
  PRODUCT_CONTEXT_CATALOG_INCOMPATIBLE: "PRODUCT_CONTEXT_CATALOG_INCOMPATIBLE",
} as const;

export type ProductContextErrorCode = (typeof CONTEXT_ERROR_CODES)[keyof typeof CONTEXT_ERROR_CODES];

export class SaasProductContextError extends Error {
  readonly code: ProductContextErrorCode;

  constructor(code: ProductContextErrorCode, message: string) {
    super(message);
    this.name = "SaasProductContextError";
    this.code = code;
  }
}

export function isSaasProductContextError(error: unknown): error is SaasProductContextError {
  return error instanceof SaasProductContextError;
}
