/**
 * V59 SaaS — Organization role definitions (RBAC)
 */

export const ORG_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const ROLE_PERMISSIONS: Record<
  OrgRole,
  readonly ("manage_members" | "manage_billing" | "manage_subscription" | "use_product")[]
> = {
  OWNER: ["manage_members", "manage_billing", "manage_subscription", "use_product"],
  ADMIN: ["manage_members", "manage_billing", "use_product"],
  MEMBER: ["use_product"],
};

export function normalizeOrgRole(role: string): OrgRole {
  const upper = role.toUpperCase();
  if (ORG_ROLES.includes(upper as OrgRole)) return upper as OrgRole;
  return "MEMBER";
}

export function roleHasPermission(role: OrgRole, permission: (typeof ROLE_PERMISSIONS)[OrgRole][number]): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAssignRole(actorRole: OrgRole, targetRole: OrgRole): boolean {
  if (actorRole === "OWNER") return true;
  if (actorRole === "ADMIN") return targetRole === "MEMBER";
  return false;
}
