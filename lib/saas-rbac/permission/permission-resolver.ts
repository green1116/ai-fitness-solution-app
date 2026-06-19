import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { RBAC_ERROR_CODES, SaasRbacError } from "../shared/rbac-errors";
import type { PermissionCheckResult } from "../shared/rbac-types";
import { getPermissionsForRole } from "./permission-cache";

export function assertValidRbacContext(ctx: TenantContext): void {
  if (!ctx.userId?.trim() || !ctx.tenantId?.trim()) {
    throw new SaasRbacError(RBAC_ERROR_CODES.RBAC_CONTEXT_INVALID, "Invalid tenant context for RBAC");
  }
}

export function resolvePermissions(ctx: TenantContext): string[] {
  assertValidRbacContext(ctx);
  if (!ctx.roleSystemCode) return [];
  return getPermissionsForRole(ctx.roleSystemCode);
}

export function checkPermission(ctx: TenantContext, permission: string): PermissionCheckResult {
  assertValidRbacContext(ctx);
  const permissions = resolvePermissions(ctx);
  const allowed = permissions.includes(permission);
  return {
    allowed,
    reason: allowed ? undefined : `Missing permission: ${permission}`,
  };
}

export function hasPermission(ctx: TenantContext, permission: string): boolean {
  return checkPermission(ctx, permission).allowed;
}
