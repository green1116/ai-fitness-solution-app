import { getSystemRoleByCode } from "@/lib/saas-foundation/rbac/role-catalog";

const rolePermissionCache = new Map<string, string[]>();

export function getPermissionsForRole(roleSystemCode: string): string[] {
  const cached = rolePermissionCache.get(roleSystemCode);
  if (cached) return [...cached];

  const role = getSystemRoleByCode(roleSystemCode);
  const permissions = role ? [...role.permissionKeys] : [];
  rolePermissionCache.set(roleSystemCode, permissions);
  return [...permissions];
}

export function clearPermissionCache(): void {
  rolePermissionCache.clear();
}

export function getPermissionCacheSize(): number {
  return rolePermissionCache.size;
}
