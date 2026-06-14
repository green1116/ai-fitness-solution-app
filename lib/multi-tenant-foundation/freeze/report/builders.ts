import { getAllMemberships } from "../../membership";
import { getAllOrganizations } from "../../organization";
import { getAllPermissions } from "../../permission";
import { getAllRoles } from "../../role";
import type { MultiTenantFreezeReport } from "../../shared/types";
import {
  CANONICAL_MULTI_TENANT_QUERY,
  MEMBERSHIP_INVITATION_WORKFLOW_STATES,
  MULTI_TENANT_TAG,
  MULTI_TENANT_VERSION,
} from "../../shared/types";
import { getAllWorkspaces } from "../../workspace";
import { buildWorkspaceCollaborationReport } from "../../workspace-collaboration/builders";
import { buildMultiTenantCoverageStats } from "../coverage";
import {
  MULTI_TENANT_FROZEN_DOMAINS,
  MULTI_TENANT_VALIDATION_GATES,
  MULTI_TENANT_WORKFLOW_WORKSPACES,
} from "../constants";
import {
  validateMembershipWorkflowPath,
  validateMultiTenantFreeze,
} from "../validators";

export function buildMultiTenantFreezeReport(): MultiTenantFreezeReport {
  const coverage = buildMultiTenantCoverageStats();
  const validation = validateMultiTenantFreeze();
  const collaborationReport = validation.valid ? buildWorkspaceCollaborationReport() : null;
  const workflowPaths = MULTI_TENANT_WORKFLOW_WORKSPACES.map(validateMembershipWorkflowPath);

  const readinessScore = Math.round((coverage.coverageScore + validation.validationScore) / 2);

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    coverageScore: coverage.coverageScore,
    organizationCount: getAllOrganizations().length,
    workspaceCount: getAllWorkspaces().length,
    membershipCount: getAllMemberships().length,
    roleCount: getAllRoles().length,
    permissionCount: getAllPermissions().length,
  };

  return {
    version: MULTI_TENANT_VERSION,
    tag: MULTI_TENANT_TAG,
    reportId: `multi-tenant-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    workflowPaths,
    exampleCollaborationReport: collaborationReport,
    moduleStatistics: {
      frozenDomains: MULTI_TENANT_FROZEN_DOMAINS.length,
      entityCatalogs: 5,
      workflowStates: MEMBERSHIP_INVITATION_WORKFLOW_STATES.length,
      validationGates: MULTI_TENANT_VALIDATION_GATES,
      reportBuilders: 3,
    },
    canonicalQuery: CANONICAL_MULTI_TENANT_QUERY,
    summary: [
      "multi-tenant-freeze-report",
      `tag=${MULTI_TENANT_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `coverageScore=${coverage.coverageScore}`,
      `organizations=${readiness.organizationCount}`,
      `workspaces=${readiness.workspaceCount}`,
      `memberships=${readiness.membershipCount}`,
      `workflowPaths=${workflowPaths.filter((p) => p.pathValid).length}/${workflowPaths.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
