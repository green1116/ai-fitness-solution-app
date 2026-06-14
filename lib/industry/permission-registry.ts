import type { Permission, RegistryValidation } from "./shared/types";

export const PERMISSION_REGISTRY: Permission[] = [
  {
    permissionId: "ind-perm-view-tender",
    permissionCode: "VIEW_TENDER",
    permissionName: "View Tender",
    description: "View tender listings and tender detail profiles",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-edit-tender",
    permissionCode: "EDIT_TENDER",
    permissionName: "Edit Tender",
    description: "Edit tender drafts and requirement profiles",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-create-proposal",
    permissionCode: "CREATE_PROPOSAL",
    permissionName: "Create Proposal",
    description: "Create and submit commercial proposals",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-review-proposal",
    permissionCode: "REVIEW_PROPOSAL",
    permissionName: "Review Proposal",
    description: "Review and score submitted proposals",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-publish-brand",
    permissionCode: "PUBLISH_BRAND",
    permissionName: "Publish Brand",
    description: "Publish brand portal onboarding submissions",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-manage-supplier",
    permissionCode: "MANAGE_SUPPLIER",
    permissionName: "Manage Supplier",
    description: "Manage supplier inventory, pricing, and service profiles",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-manage-workspace",
    permissionCode: "MANAGE_WORKSPACE",
    permissionName: "Manage Workspace",
    description: "Manage organization workspace memberships",
    mode: "industry-platform",
  },
  {
    permissionId: "ind-perm-operate-platform",
    permissionCode: "OPERATE_PLATFORM",
    permissionName: "Operate Platform",
    description: "Operate industry platform governance and monitoring",
    mode: "industry-platform",
  },
];

export function getAllPermissions(): Permission[] {
  return [...PERMISSION_REGISTRY];
}

export function getPermissionById(permissionId: string): Permission | undefined {
  return PERMISSION_REGISTRY.find((permission) => permission.permissionId === permissionId);
}

export function getPermissionByCode(permissionCode: string): Permission | undefined {
  return PERMISSION_REGISTRY.find((permission) => permission.permissionCode === permissionCode);
}

export function validatePermissionRegistry(): RegistryValidation {
  const permissions = getAllPermissions();
  const requiredCodes = [
    "VIEW_TENDER",
    "EDIT_TENDER",
    "CREATE_PROPOSAL",
    "REVIEW_PROPOSAL",
    "PUBLISH_BRAND",
    "MANAGE_SUPPLIER",
  ];

  const codeCoverage = requiredCodes.every((code) =>
    permissions.some((permission) => permission.permissionCode === code),
  );
  const fieldValid = permissions.every(
    (permission) =>
      permission.permissionId.length > 0 &&
      permission.permissionCode.length > 0 &&
      permission.permissionName.length > 0 &&
      permission.mode === "industry-platform",
  );
  const uniqueCodes = new Set(permissions.map((permission) => permission.permissionCode)).size;

  const valid = permissions.length >= 8 && codeCoverage && fieldValid && uniqueCodes === permissions.length;

  return {
    valid,
    count: permissions.length,
    summary: `permission-registry count=${permissions.length} required=${requiredCodes.length} valid=${valid}`,
  };
}
