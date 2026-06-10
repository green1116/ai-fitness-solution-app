import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const ROLE_RUNTIME_VERSION = "v10.5-role-runtime-1" as const;

export type RoleKind = "owner" | "admin" | "manager" | "member" | "viewer";

export interface RoleDefinition {
  roleId: string;
  kind: RoleKind;
  name: string;
  description: string;
  hierarchyLevel: number;
  assignable: boolean;
}

export interface RoleRuntimePayload {
  version: typeof ROLE_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  roles: RoleDefinition[];
  summary: string;
}
