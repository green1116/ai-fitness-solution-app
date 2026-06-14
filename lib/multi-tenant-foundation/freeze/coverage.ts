import { buildAccessControlValidation } from "../access-control/builders";
import { getAllAccessRules } from "../access-control/data";
import { getAllMemberships } from "../membership";
import { getAllOrganizations } from "../organization";
import { getAllPermissions } from "../permission";
import { getAllRoles } from "../role";
import type { MultiTenantCoverageStats } from "../shared/types";
import { CANONICAL_MULTI_TENANT_QUERY } from "../shared/types";
import { getAllWorkspaces } from "../workspace";
import { buildWorkspaceCollaborationReport } from "../workspace-collaboration/builders";
import { getAllWorkspaceCollaborations } from "../workspace-collaboration/data";

export function buildMultiTenantCoverageStats(): MultiTenantCoverageStats {
  const organizations = getAllOrganizations();
  const organizationChecks = [
    organizations.length >= 10,
    organizations.every((org) => org.organizationId.length > 0 && org.status === "active"),
    organizations.every((org) => org.mode === "multi-tenant"),
    organizations.some(
      (org) => org.organizationId === CANONICAL_MULTI_TENANT_QUERY.organizationId,
    ),
  ];
  const organizationCoverage = Math.round(
    (organizationChecks.filter(Boolean).length / organizationChecks.length) * 100,
  );

  const workspaces = getAllWorkspaces();
  const workspaceChecks = [
    workspaces.length >= 10,
    workspaces.every((ws) => ws.workspaceName.length > 0),
    workspaces.every((ws) => ws.mode === "multi-tenant"),
    workspaces.some((ws) => ws.workspaceId === CANONICAL_MULTI_TENANT_QUERY.workspaceId),
  ];
  const workspaceCoverage = Math.round(
    (workspaceChecks.filter(Boolean).length / workspaceChecks.length) * 100,
  );

  const memberships = getAllMemberships();
  const membershipChecks = [
    memberships.length >= 10,
    memberships.every((m) => m.memberId.length > 0 && m.status === "active"),
    memberships.every((m) => m.mode === "multi-tenant"),
    new Set(memberships.map((m) => m.workspaceId)).size >= 10,
  ];
  const membershipCoverage = Math.round(
    (membershipChecks.filter(Boolean).length / membershipChecks.length) * 100,
  );

  const roles = getAllRoles();
  const roleChecks = [
    roles.length >= 6,
    roles.every((role) => role.permissionIds.length > 0),
    roles.every((role) => role.mode === "multi-tenant"),
    new Set(roles.map((role) => role.scope)).size === 3,
  ];
  const roleCoverage = Math.round(
    (roleChecks.filter(Boolean).length / roleChecks.length) * 100,
  );

  const permissions = getAllPermissions();
  const permissionChecks = [
    permissions.length >= 10,
    permissions.every((p) => p.action.length > 0 && p.resource.length > 0),
    permissions.every((p) => p.mode === "multi-tenant"),
    new Set(permissions.map((p) => p.resource)).size >= 4,
  ];
  const permissionCoverage = Math.round(
    (permissionChecks.filter(Boolean).length / permissionChecks.length) * 100,
  );

  const accessControl = buildAccessControlValidation();
  const accessRules = getAllAccessRules();
  const accessControlChecks = [
    accessRules.length >= 10,
    accessControl.valid,
    accessControl.roleValid,
    accessControl.permissionValid,
  ];
  const accessControlCoverage = Math.round(
    (accessControlChecks.filter(Boolean).length / accessControlChecks.length) * 100,
  );

  const collaborationReport = buildWorkspaceCollaborationReport();
  const collaborations = getAllWorkspaceCollaborations();
  const collaborationChecks = [
    collaborations.length >= 10,
    collaborationReport.validation.valid,
    collaborationReport.validation.brandWorkspaceCollaboration,
    collaborationReport.validation.supplierWorkspaceCollaboration,
    collaborationReport.validation.tenderWorkspaceCollaboration,
  ];
  const collaborationCoverage = Math.round(
    (collaborationChecks.filter(Boolean).length / collaborationChecks.length) * 100,
  );

  const coverageScore = Math.round(
    (organizationCoverage +
      workspaceCoverage +
      membershipCoverage +
      roleCoverage +
      permissionCoverage +
      accessControlCoverage +
      collaborationCoverage) /
      7,
  );

  return {
    organizationCoverage,
    workspaceCoverage,
    membershipCoverage,
    roleCoverage,
    permissionCoverage,
    accessControlCoverage,
    collaborationCoverage,
    coverageScore,
  };
}
