/**
 * WP-RUNTIME-OPS-TENANT-ROLE-GATE-1
 * Server-side role allowlist for tenant Ops mutations.
 * Reuses OrgRole + ROLE_PERMISSIONS — no new auth model.
 */

import {
  roleHasPermission,
  type OrgRole,
} from "@/lib/organization/role.service";

export const TENANT_OPS_ROLE_GATE_ID = "tenant-ops-role-gate-1" as const;
export const TENANT_OPS_ROLE_GATE_VERSION =
  "runtime-ops-tenant-role-gate-1" as const;

/** Permission already granted to OWNER/ADMIN; MEMBER lacks it. */
export const TENANT_OPS_MUTATE_PERMISSION = "manage_members" as const;

export const TENANT_OPS_ROLE_FORBIDDEN_REASON = "role-forbidden" as const;

/**
 * Allow tenant REVIEW/RECOVER/EXECUTE only when membership role
 * carries the existing manage_members permission (OWNER/ADMIN).
 */
export function isTenantOpsRoleAllowed(role: OrgRole): boolean {
  return roleHasPermission(role, TENANT_OPS_MUTATE_PERMISSION);
}
