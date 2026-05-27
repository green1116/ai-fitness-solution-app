/**
 * V3.7-H11 Enterprise Governance — role catalog DTO (static, no real auth)
 */

import { buildAccessMatrixDto } from "../access/access-matrix.dto";

export const ROLE_CATALOG_DTO_VERSION = "3.7-h11-role-catalog-1" as const;

export type RoleCategory = "ops" | "release" | "audit" | "enterprise";

export type RoleCatalogEntry = {
  roleId: string;
  roleName: string;
  roleCategory: RoleCategory;
  permissions: string[];
  accessibleResources: string[];
  governanceScope: string;
  readonlyAccess: boolean;
};

export type RoleCatalogDto = {
  version: typeof ROLE_CATALOG_DTO_VERSION;
  catalogId: string;
  entries: RoleCatalogEntry[];
  defaultRoleId: string;
  summary: string;
};

const ROLE_CATEGORY_MAP: Record<string, RoleCategory> = {
  "ops-viewer": "ops",
  "release-reviewer": "release",
  "audit-reviewer": "audit",
  "enterprise-admin": "enterprise",
};

const GOVERNANCE_SCOPE_MAP: Record<RoleCategory, string> = {
  ops: "ops-readonly",
  release: "release-governance",
  audit: "audit-governance",
  enterprise: "enterprise-governance",
};

export function buildRoleCatalogDto(input?: { deploymentId?: string }): RoleCatalogDto {
  const deploymentId = input?.deploymentId ?? "role-catalog";
  const catalogId = `RCT-V37H11-${deploymentId.slice(0, 8)}`;
  const matrix = buildAccessMatrixDto({ deploymentId });

  const entries: RoleCatalogEntry[] = matrix.roles.map((role) => {
    const granted = matrix.permissions.filter((p) => p.roleId === role.id && p.granted);
    const category = ROLE_CATEGORY_MAP[role.id] ?? "ops";

    return {
      roleId: role.id,
      roleName: role.label,
      roleCategory: category,
      permissions: granted.map((p) => `${p.action}:${p.resourceId}`),
      accessibleResources: granted.map((p) => p.resourceId),
      governanceScope: GOVERNANCE_SCOPE_MAP[category],
      readonlyAccess: true,
    };
  });

  return {
    version: ROLE_CATALOG_DTO_VERSION,
    catalogId,
    entries,
    defaultRoleId: matrix.defaultRole,
    summary: `role-catalog id=${catalogId} roles=${entries.length} default=${matrix.defaultRole}`,
  };
}
