import { SAAS_PERMISSIONS } from "@/lib/saas-foundation/rbac/permission-catalog";
import { SAAS_SYSTEM_ROLES } from "@/lib/saas-foundation/rbac/role-catalog";
import { validatePermissionCatalog, validateRoleCatalog } from "@/lib/saas-foundation/rbac/rbac-validation";
import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { resolvePermissions } from "../permission/permission-resolver";

export interface SaasRbacP5Validation {
  valid: boolean;
  permissionCatalogCount: number;
  roleCatalogCount: number;
  permissionCatalogValid: boolean;
  roleCatalogValid: boolean;
  summary: string;
}

export function validateSaasRbacP5(): SaasRbacP5Validation {
  const permissionValidation = validatePermissionCatalog();
  const roleValidation = validateRoleCatalog();

  const valid =
    permissionValidation.valid &&
    roleValidation.valid &&
    SAAS_PERMISSIONS.length >= 16 &&
    SAAS_SYSTEM_ROLES.length >= 10;

  return {
    valid,
    permissionCatalogCount: SAAS_PERMISSIONS.length,
    roleCatalogCount: SAAS_SYSTEM_ROLES.length,
    permissionCatalogValid: permissionValidation.valid,
    roleCatalogValid: roleValidation.valid,
    summary: [
      `permissionCatalogValid=${permissionValidation.valid}`,
      `roleCatalogValid=${roleValidation.valid}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function buildOwnerContext(): TenantContext {
  return {
    userId: "rbac-owner-user",
    tenantId: "rbac-owner-tenant",
    organizationId: "rbac-owner-org",
    workspaceId: "rbac-owner-workspace",
    portalType: "enterprise",
    roleSystemCode: "enterprise_owner",
    membershipId: "rbac-owner-membership",
  };
}

export function buildSupplierRepContext(): TenantContext {
  return {
    userId: "rbac-supplier-rep-user",
    tenantId: "rbac-supplier-tenant",
    organizationId: "rbac-supplier-org",
    workspaceId: "rbac-supplier-workspace",
    portalType: "supplier",
    roleSystemCode: "supplier_rep",
    membershipId: "rbac-supplier-membership",
  };
}

export function ownerHasRequiredPermissions(): boolean {
  const permissions = resolvePermissions(buildOwnerContext());
  return (
    permissions.includes("quote:create") &&
    permissions.includes("delivery:execute") &&
    permissions.includes("tenant:admin")
  );
}

export function supplierRepDeniedPermissions(): boolean {
  const permissions = resolvePermissions(buildSupplierRepContext());
  return (
    !permissions.includes("tenant:admin") &&
    !permissions.includes("billing:read") &&
    !permissions.includes("release:publish")
  );
}
