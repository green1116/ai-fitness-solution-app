export class SaasFoundationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SaasFoundationError";
    this.code = code;
  }
}

export const SAAS_ERROR_CODES = {
  INVALID_PERMISSION_KEY: "INVALID_PERMISSION_KEY",
  INVALID_ROLE_SYSTEM_CODE: "INVALID_ROLE_SYSTEM_CODE",
  INVALID_PLAN_CODE: "INVALID_PLAN_CODE",
  INVALID_SUBSCRIPTION_PERIOD: "INVALID_SUBSCRIPTION_PERIOD",
  MEMBERSHIP_ORG_MISMATCH: "MEMBERSHIP_ORG_MISMATCH",
  FORBIDDEN_V47_IMPORT: "FORBIDDEN_V47_IMPORT",
} as const;
