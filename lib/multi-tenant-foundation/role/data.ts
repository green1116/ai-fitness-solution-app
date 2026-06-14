import type { Role } from "../shared/types";

export const ROLES: Role[] = [
  {
    roleId: "role-brand-admin",
    roleName: "Brand Admin",
    scope: "brand",
    permissionIds: [
      "perm-brand-profile-read",
      "perm-brand-profile-write",
      "perm-brand-product-read",
      "perm-brand-product-write",
      "perm-workspace-manage",
    ],
    mode: "multi-tenant",
  },
  {
    roleId: "role-brand-editor",
    roleName: "Brand Editor",
    scope: "brand",
    permissionIds: [
      "perm-brand-profile-read",
      "perm-brand-product-read",
      "perm-brand-product-write",
    ],
    mode: "multi-tenant",
  },
  {
    roleId: "role-supplier-admin",
    roleName: "Supplier Admin",
    scope: "supplier",
    permissionIds: [
      "perm-supplier-inventory-read",
      "perm-supplier-inventory-write",
      "perm-supplier-pricing-write",
      "perm-workspace-manage",
    ],
    mode: "multi-tenant",
  },
  {
    roleId: "role-supplier-editor",
    roleName: "Supplier Editor",
    scope: "supplier",
    permissionIds: ["perm-supplier-inventory-read", "perm-supplier-inventory-write"],
    mode: "multi-tenant",
  },
  {
    roleId: "role-tender-owner-admin",
    roleName: "Tender Owner Admin",
    scope: "tender-owner",
    permissionIds: [
      "perm-tender-create",
      "perm-tender-publish",
      "perm-tender-review",
      "perm-tender-approve",
      "perm-workspace-manage",
    ],
    mode: "multi-tenant",
  },
  {
    roleId: "role-tender-owner-publisher",
    roleName: "Tender Owner Publisher",
    scope: "tender-owner",
    permissionIds: ["perm-tender-create", "perm-tender-publish"],
    mode: "multi-tenant",
  },
];

export function getAllRoles(): Role[] {
  return [...ROLES];
}

export function getRoleById(roleId: string): Role | undefined {
  return ROLES.find((r) => r.roleId === roleId);
}

export function getRolesByScope(scope: Role["scope"]): Role[] {
  return ROLES.filter((r) => r.scope === scope);
}
