/**
 * V59.5 — RBAC guard (role-permission matrix enforcement)
 */

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import {
  roleHasPermission,
  type OrgRole,
  ROLE_PERMISSIONS,
} from "@/lib/organization/role.service";

export type OrgPermission = (typeof ROLE_PERMISSIONS)[OrgRole][number];

export function enforceRbacGuard(role: OrgRole, permission: OrgPermission): void {
  if (!roleHasPermission(role, permission)) {
    throw new FeatureGateError(`Role does not permit: ${permission}`);
  }
}

export { roleHasPermission, type OrgRole };
