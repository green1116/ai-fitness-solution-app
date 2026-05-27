/**
 * V3.7-H11 Enterprise Governance — access governance builder (readonly aggregation)
 */

import { buildRoleCatalogDto } from "./role-catalog.dto";
import { buildAccessMatrix } from "../access/access-matrix";
import { buildPolicyReview } from "../access/policy-review";

export const ACCESS_GOVERNANCE_VERSION = "3.7-h11-governance-1" as const;

export type AccessGovernanceCoverage = {
  total: number;
  covered: number;
  ratio: number;
};

export type EffectiveGovernanceEntry = {
  roleId: string;
  resourceId: string;
  granted: boolean;
  scope: string;
};

export type AccessGovernance = {
  version: typeof ACCESS_GOVERNANCE_VERSION;
  governanceId: string;
  governanceSummary: string;
  roleCoverage: AccessGovernanceCoverage;
  resourceCoverage: AccessGovernanceCoverage;
  permissionCoverage: AccessGovernanceCoverage;
  readonlyAccessCoverage: AccessGovernanceCoverage;
  effectiveGovernance: EffectiveGovernanceEntry[];
  summary: string;
};

function coverage(total: number, covered: number): AccessGovernanceCoverage {
  return {
    total,
    covered,
    ratio: total === 0 ? 0 : Math.round((covered / total) * 100),
  };
}

export function buildAccessGovernance(input?: { deploymentId?: string }): AccessGovernance {
  const deploymentId = input?.deploymentId ?? "access-governance";
  const governanceId = `GOV-V37H11-${deploymentId.slice(0, 8)}`;
  const catalog = buildRoleCatalogDto({ deploymentId });
  const matrix = buildAccessMatrix({ deploymentId });
  const review = buildPolicyReview({ deploymentId });
  const dto = matrix.dto;

  const rolesWithAccess = catalog.entries.filter((e) => e.accessibleResources.length > 0).length;
  const resourcesWithAccess = new Set(
    dto.permissions.filter((p) => p.granted).map((p) => p.resourceId),
  ).size;
  const grantedPermissions = dto.permissions.filter((p) => p.granted).length;
  const readonlyRoles = catalog.entries.filter((e) => e.readonlyAccess).length;

  const effectiveGovernance: EffectiveGovernanceEntry[] = review.effectiveAccess
    .filter((e) => e.granted)
    .map((entry) => {
      const role = catalog.entries.find((r) => r.roleId === entry.roleId);
      return {
        roleId: entry.roleId,
        resourceId: entry.resourceId,
        granted: entry.granted,
        scope: role?.governanceScope ?? "ops-readonly",
      };
    });

  return {
    version: ACCESS_GOVERNANCE_VERSION,
    governanceId,
    governanceSummary: `enterprise-governance roles=${dto.roles.length} resources=${dto.resources.length} granted=${grantedPermissions}`,
    roleCoverage: coverage(dto.roles.length, rolesWithAccess),
    resourceCoverage: coverage(dto.resources.length, resourcesWithAccess),
    permissionCoverage: coverage(dto.permissions.length, grantedPermissions),
    readonlyAccessCoverage: coverage(catalog.entries.length, readonlyRoles),
    effectiveGovernance,
    summary: `access-governance id=${governanceId} roleCoverage=${rolesWithAccess}/${dto.roles.length} resourceCoverage=${resourcesWithAccess}/${dto.resources.length} permissionCoverage=${grantedPermissions}/${dto.permissions.length}`,
  };
}
