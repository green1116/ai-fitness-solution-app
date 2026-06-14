import type { Permission } from "../shared/types";

export const PERMISSIONS: Permission[] = [
  {
    permissionId: "perm-brand-profile-read",
    action: "read",
    resource: "brand.profile",
    description: "Read brand profile data",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-brand-profile-write",
    action: "write",
    resource: "brand.profile",
    description: "Update brand profile data",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-brand-product-read",
    action: "read",
    resource: "brand.product",
    description: "Read brand product catalog",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-brand-product-write",
    action: "write",
    resource: "brand.product",
    description: "Update brand product catalog",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-supplier-inventory-read",
    action: "read",
    resource: "supplier.inventory",
    description: "Read supplier inventory",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-supplier-inventory-write",
    action: "write",
    resource: "supplier.inventory",
    description: "Update supplier inventory",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-supplier-pricing-write",
    action: "write",
    resource: "supplier.pricing",
    description: "Update supplier pricing",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-tender-create",
    action: "create",
    resource: "tender.tender",
    description: "Create tender drafts",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-tender-publish",
    action: "publish",
    resource: "tender.tender",
    description: "Publish approved tenders",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-tender-review",
    action: "review",
    resource: "tender.tender",
    description: "Review tender submissions",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-tender-approve",
    action: "approve",
    resource: "tender.tender",
    description: "Approve tender submissions",
    mode: "multi-tenant",
  },
  {
    permissionId: "perm-workspace-manage",
    action: "manage",
    resource: "workspace.membership",
    description: "Manage workspace memberships",
    mode: "multi-tenant",
  },
];

export function getAllPermissions(): Permission[] {
  return [...PERMISSIONS];
}

export function getPermissionById(permissionId: string): Permission | undefined {
  return PERMISSIONS.find((p) => p.permissionId === permissionId);
}
