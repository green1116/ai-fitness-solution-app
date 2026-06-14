import { getAllBrandProfiles } from "@/lib/brand-portal/brand-profile";
import { getAllSupplierProfiles } from "@/lib/supplier-portal/supplier-profile";
import { getAllTenderProfiles } from "@/lib/tender-marketplace/tender-profile";
import { getAllMemberships } from "../membership";
import { getAllOrganizations } from "../organization";
import { getAllPermissions } from "../permission";
import { getAllRoles } from "../role";
import { getAllWorkspaces } from "../workspace";
import type { MultiTenantValidation } from "../shared/types";
import { CANONICAL_MULTI_TENANT_QUERY } from "../shared/types";

function validateV26BrandCompatibility(): boolean {
  const brandIds = new Set(getAllBrandProfiles().map((brand) => brand.brandId));
  return getAllOrganizations()
    .filter((org) => org.organizationType === "brand")
    .every((org) => brandIds.has(org.entityRef));
}

function validateV27SupplierCompatibility(): boolean {
  const supplierIds = new Set(getAllSupplierProfiles().map((s) => s.supplierId));
  return getAllOrganizations()
    .filter((org) => org.organizationType === "supplier")
    .every((org) => supplierIds.has(org.entityRef));
}

function validateV28TenderCompatibility(): boolean {
  const tenderIds = new Set(getAllTenderProfiles().map((t) => t.tenderId));
  return getAllOrganizations()
    .filter((org) => org.organizationType === "tender-owner")
    .every((org) => tenderIds.has(org.entityRef));
}

export function validateMultiTenantFoundation(): MultiTenantValidation {
  const organizations = getAllOrganizations();
  const workspaces = getAllWorkspaces();
  const memberships = getAllMemberships();
  const roles = getAllRoles();
  const permissions = getAllPermissions();
  const permissionIds = new Set(permissions.map((p) => p.permissionId));
  const workspaceIds = new Set(workspaces.map((ws) => ws.workspaceId));
  const organizationIds = new Set(organizations.map((org) => org.organizationId));
  const roleIds = new Set(roles.map((r) => r.roleId));
  const canonicalOrg = organizations.find(
    (org) => org.organizationId === CANONICAL_MULTI_TENANT_QUERY.organizationId,
  );

  const organizationExists =
    organizations.length >= 10 &&
    organizations.every(
      (org) =>
        org.organizationId.length > 0 &&
        org.organizationName.length > 0 &&
        org.entityRef.length > 0 &&
        org.status === "active" &&
        org.mode === "multi-tenant",
    ) &&
    canonicalOrg !== undefined;

  const workspaceExists =
    workspaces.length >= 10 &&
    workspaces.every(
      (ws) =>
        organizationIds.has(ws.organizationId) &&
        ws.workspaceName.length > 0 &&
        ws.mode === "multi-tenant",
    ) &&
    workspaces.some((ws) => ws.workspaceId === CANONICAL_MULTI_TENANT_QUERY.workspaceId);

  const membershipExists =
    memberships.length >= 10 &&
    memberships.every(
      (m) =>
        workspaceIds.has(m.workspaceId) &&
        roleIds.has(m.roleId) &&
        m.memberId.length > 0 &&
        m.mode === "multi-tenant",
    );

  const roleExists =
    roles.length >= 6 &&
    roles.every(
      (role) =>
        role.roleName.length > 0 &&
        role.permissionIds.length > 0 &&
        role.permissionIds.every((id) => permissionIds.has(id)) &&
        role.mode === "multi-tenant",
    );

  const permissionExists =
    permissions.length >= 10 &&
    permissions.every(
      (p) => p.action.length > 0 && p.resource.length > 0 && p.mode === "multi-tenant",
    );

  const v26BrandCompatible = validateV26BrandCompatibility();
  const v27SupplierCompatible = validateV27SupplierCompatibility();
  const v28TenderCompatible = validateV28TenderCompatibility();

  return {
    valid:
      organizationExists &&
      workspaceExists &&
      membershipExists &&
      roleExists &&
      permissionExists &&
      v26BrandCompatible &&
      v27SupplierCompatible &&
      v28TenderCompatible,
    organizationExists,
    workspaceExists,
    membershipExists,
    roleExists,
    permissionExists,
    v26BrandCompatible,
    v27SupplierCompatible,
    v28TenderCompatible,
  };
}
