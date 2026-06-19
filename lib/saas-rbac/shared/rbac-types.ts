export const SAAS_RBAC_VERSION = "v48-saas-rbac-p5" as const;
export const SAAS_RBAC_P5_TAG = "v48-saas-rbac-p5" as const;

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface AccessAuditRecord {
  timestamp: Date;
  userId: string;
  tenantId: string;
  roleSystemCode?: string;
  permission: string;
  allowed: boolean;
}

export const RBAC_ERROR_CODES = {
  RBAC_PERMISSION_DENIED: "RBAC_PERMISSION_DENIED",
  RBAC_ROLE_DENIED: "RBAC_ROLE_DENIED",
  RBAC_CONTEXT_INVALID: "RBAC_CONTEXT_INVALID",
} as const;

export type RbacErrorCode = (typeof RBAC_ERROR_CODES)[keyof typeof RBAC_ERROR_CODES];
