import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import type { RoleKind } from "../role/types";

export const PERMISSION_RUNTIME_VERSION = "v10.5-permission-runtime-1" as const;

export type PermissionDomain =
  | "plan-access"
  | "budget-access"
  | "tender-access"
  | "billing-access"
  | "admin-access";

export type PermissionLevel = "none" | "read" | "write" | "full";

export interface PermissionGrant {
  grantId: string;
  domain: PermissionDomain;
  roleKind: RoleKind;
  level: PermissionLevel;
  description: string;
}

export interface PermissionRuntimePayload {
  version: typeof PERMISSION_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  grants: PermissionGrant[];
  summary: string;
}
