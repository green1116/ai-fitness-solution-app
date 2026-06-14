import { getAllMemberships } from "../membership";
import { getAllOrganizations } from "../organization";
import { getAllPermissions } from "../permission";
import { getAllRoles } from "../role";
import type { MultiTenantReport } from "../shared/types";
import {
  CANONICAL_MULTI_TENANT_QUERY,
  MULTI_TENANT_VERSION,
} from "../shared/types";
import { getAllWorkspaces } from "../workspace";
import { validateMultiTenantFoundation } from "../validation/validators";

export function buildMultiTenantReport(): MultiTenantReport {
  const organizations = getAllOrganizations();
  const workspaces = getAllWorkspaces();
  const memberships = getAllMemberships();
  const roles = getAllRoles();
  const permissions = getAllPermissions();
  const validation = validateMultiTenantFoundation();

  return {
    version: MULTI_TENANT_VERSION,
    reportId: `multi-tenant-report-${Date.now()}`,
    organizationCount: organizations.length,
    workspaceCount: workspaces.length,
    membershipCount: memberships.length,
    roleCount: roles.length,
    permissionCount: permissions.length,
    validation,
    summary: [
      "multi-tenant-report",
      `organizations=${organizations.length}`,
      `workspaces=${workspaces.length}`,
      `memberships=${memberships.length}`,
      `roles=${roles.length}`,
      `permissions=${permissions.length}`,
      `valid=${validation.valid}`,
      `v26Compatible=${validation.v26BrandCompatible}`,
      `v27Compatible=${validation.v27SupplierCompatible}`,
      `v28Compatible=${validation.v28TenderCompatible}`,
      `canonical=${CANONICAL_MULTI_TENANT_QUERY.organizationId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
