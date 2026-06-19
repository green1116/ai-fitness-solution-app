import { getSystemRoleByCode } from "@/lib/saas-foundation/rbac/role-catalog";
import type { TenantContext } from "../tenant-context/context-types";

export function resolvePermissions(ctx: TenantContext): string[] {
  if (!ctx.roleSystemCode) return [];
  const role = getSystemRoleByCode(ctx.roleSystemCode);
  return role ? [...role.permissionKeys] : [];
}

export function hasPermission(ctx: TenantContext, permissionKey: string): boolean {
  return resolvePermissions(ctx).includes(permissionKey);
}
