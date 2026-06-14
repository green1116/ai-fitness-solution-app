import type { IndustryRoleType, RegistryValidation, Role } from "./shared/types";
import { getPermissionById } from "./permission-registry";

export const ROLE_REGISTRY: Role[] = [
  {
    roleId: "ind-role-brand-admin",
    roleName: "Brand Admin",
    roleType: "brand-admin",
    description: "Full brand portal administration and publishing",
    permissionIds: [
      "ind-perm-publish-brand",
      "ind-perm-manage-workspace",
      "ind-perm-view-tender",
    ],
    mode: "industry-platform",
  },
  {
    roleId: "ind-role-supplier-admin",
    roleName: "Supplier Admin",
    roleType: "supplier-admin",
    description: "Full supplier portal inventory and pricing management",
    permissionIds: [
      "ind-perm-manage-supplier",
      "ind-perm-manage-workspace",
      "ind-perm-view-tender",
    ],
    mode: "industry-platform",
  },
  {
    roleId: "ind-role-buyer-admin",
    roleName: "Buyer Admin",
    roleType: "buyer-admin",
    description: "Tender marketplace administration and publishing",
    permissionIds: [
      "ind-perm-view-tender",
      "ind-perm-edit-tender",
      "ind-perm-manage-workspace",
    ],
    mode: "industry-platform",
  },
  {
    roleId: "ind-role-consultant",
    roleName: "Consultant",
    roleType: "consultant",
    description: "Advisory access to tenders and proposals",
    permissionIds: ["ind-perm-view-tender", "ind-perm-create-proposal"],
    mode: "industry-platform",
  },
  {
    roleId: "ind-role-bid-manager",
    roleName: "Bid Manager",
    roleType: "bid-manager",
    description: "Manage bid submissions and commercial proposals",
    permissionIds: [
      "ind-perm-view-tender",
      "ind-perm-edit-tender",
      "ind-perm-create-proposal",
    ],
    mode: "industry-platform",
  },
  {
    roleId: "ind-role-proposal-reviewer",
    roleName: "Proposal Reviewer",
    roleType: "proposal-reviewer",
    description: "Review and score submitted proposals",
    permissionIds: ["ind-perm-view-tender", "ind-perm-review-proposal"],
    mode: "industry-platform",
  },
  {
    roleId: "ind-role-operator",
    roleName: "Operator",
    roleType: "operator",
    description: "Platform operations and governance oversight",
    permissionIds: [
      "ind-perm-operate-platform",
      "ind-perm-manage-workspace",
      "ind-perm-view-tender",
    ],
    mode: "industry-platform",
  },
];

export function getAllRoles(): Role[] {
  return [...ROLE_REGISTRY];
}

export function getRoleById(roleId: string): Role | undefined {
  return ROLE_REGISTRY.find((role) => role.roleId === roleId);
}

export function getRolesByType(roleType: IndustryRoleType): Role[] {
  return ROLE_REGISTRY.filter((role) => role.roleType === roleType);
}

export function validateRoleRegistry(): RegistryValidation {
  const roles = getAllRoles();
  const requiredRoleTypes: IndustryRoleType[] = [
    "brand-admin",
    "supplier-admin",
    "buyer-admin",
    "consultant",
    "bid-manager",
    "proposal-reviewer",
    "operator",
  ];

  const typeCoverage = requiredRoleTypes.every((type) =>
    roles.some((role) => role.roleType === type),
  );
  const permissionLinksValid = roles.every(
    (role) =>
      role.roleName.length > 0 &&
      role.permissionIds.length > 0 &&
      role.permissionIds.every((permissionId) => getPermissionById(permissionId) !== undefined) &&
      role.mode === "industry-platform",
  );

  const valid = roles.length >= 7 && typeCoverage && permissionLinksValid;

  return {
    valid,
    count: roles.length,
    summary: `role-registry count=${roles.length} types=${requiredRoleTypes.filter((t) => roles.some((r) => r.roleType === t)).length}/7 valid=${valid}`,
  };
}
