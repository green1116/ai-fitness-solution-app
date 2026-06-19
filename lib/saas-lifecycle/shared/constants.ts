export const SAAS_LIFECYCLE_VERSION = "v48-saas-lifecycle-p3" as const;
export const SAAS_LIFECYCLE_P3_TAG = "v48-saas-lifecycle-p3" as const;

export const DEFAULT_PORTAL_TYPE = "enterprise" as const;
export const DEFAULT_ORG_TYPE = "enterprise" as const;
export const DEFAULT_WORKSPACE_TYPE = "project" as const;
export const OWNER_ROLE_SYSTEM_CODE = "enterprise_owner" as const;
export const TRIAL_PLAN_CODE = "trial" as const;
export const TRIAL_DURATION_DAYS = 14;

export const SAAS_LIFECYCLE_ERROR_CODES = {
  INVALID_BOOTSTRAP_INPUT: "INVALID_BOOTSTRAP_INPUT",
  OWNER_ROLE_NOT_FOUND: "OWNER_ROLE_NOT_FOUND",
  TRIAL_PLAN_NOT_FOUND: "TRIAL_PLAN_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  BOOTSTRAP_FAILED: "BOOTSTRAP_FAILED",
} as const;

export class SaasLifecycleError extends Error {
  readonly code: (typeof SAAS_LIFECYCLE_ERROR_CODES)[keyof typeof SAAS_LIFECYCLE_ERROR_CODES];

  constructor(
    code: (typeof SAAS_LIFECYCLE_ERROR_CODES)[keyof typeof SAAS_LIFECYCLE_ERROR_CODES],
    message: string,
  ) {
    super(message);
    this.name = "SaasLifecycleError";
    this.code = code;
  }
}
