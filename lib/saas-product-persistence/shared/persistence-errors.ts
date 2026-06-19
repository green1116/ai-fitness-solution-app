export const PERSISTENCE_ERROR_CODES = {
  PERSISTENCE_SCHEMA_INVALID: "PERSISTENCE_SCHEMA_INVALID",
  PERSISTENCE_TENANT_ISOLATION_FAILED: "PERSISTENCE_TENANT_ISOLATION_FAILED",
  PERSISTENCE_SEED_FAILED: "PERSISTENCE_SEED_FAILED",
  PERSISTENCE_NOT_FOUND: "PERSISTENCE_NOT_FOUND",
  PERSISTENCE_TENANT_MISMATCH: "PERSISTENCE_TENANT_MISMATCH",
  PERSISTENCE_INVALID_TRANSITION: "PERSISTENCE_INVALID_TRANSITION",
  PERSISTENCE_INVALID_WORKFLOW_TYPE: "PERSISTENCE_INVALID_WORKFLOW_TYPE",
  PERSISTENCE_WORKSPACE_REQUIRED: "PERSISTENCE_WORKSPACE_REQUIRED",
} as const;

export type PersistenceErrorCode = (typeof PERSISTENCE_ERROR_CODES)[keyof typeof PERSISTENCE_ERROR_CODES];

export class SaasProductPersistenceError extends Error {
  readonly code: PersistenceErrorCode;

  constructor(code: PersistenceErrorCode, message: string) {
    super(message);
    this.name = "SaasProductPersistenceError";
    this.code = code;
  }
}

export function isSaasProductPersistenceError(error: unknown): error is SaasProductPersistenceError {
  return error instanceof SaasProductPersistenceError;
}
