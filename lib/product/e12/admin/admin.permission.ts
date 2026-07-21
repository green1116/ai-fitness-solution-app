/**
 * E12-P3 — Permission System
 */

import { listAdminRoles } from "./admin.role";
import type {
  AdminPermission,
  PermissionEvaluationContext,
  PermissionEvaluationResult,
} from "./admin.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function evaluateAdminPermission(
  context: PermissionEvaluationContext,
): PermissionEvaluationResult {
  const userId = context.userId.trim();
  const permission = context.permission;

  const userRoles = listAdminRoles({
    userId,
    organizationId: context.organizationId?.trim(),
    productTenantId: context.productTenantId?.trim(),
  });

  if (userRoles.length === 0) {
    return {
      decision: "DENY",
      userId,
      permission,
      reason: "no admin role assigned",
      evaluatedAt: nowIso(),
    };
  }

  for (const role of userRoles) {
    if (role.permissions.includes(permission)) {
      return {
        decision: "ALLOW",
        userId,
        permission,
        role: role.role,
        reason: `granted via role ${role.role}`,
        evaluatedAt: nowIso(),
      };
    }
  }

  return {
    decision: "DENY",
    userId,
    permission,
    reason: "permission not granted by any role",
    evaluatedAt: nowIso(),
  };
}

export function hasAdminPermission(
  context: PermissionEvaluationContext,
): boolean {
  return evaluateAdminPermission(context).decision === "ALLOW";
}

export function listUserPermissions(userId: string): AdminPermission[] {
  const perms = new Set<AdminPermission>();
  for (const role of listAdminRoles({ userId: userId.trim() })) {
    for (const p of role.permissions) perms.add(p);
  }
  return [...perms].sort();
}
