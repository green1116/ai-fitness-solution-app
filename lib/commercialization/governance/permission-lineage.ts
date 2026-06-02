/**
 * V3.7-H11 Enterprise Governance — permission lineage surface (static aggregation)
 */

import { buildRoleCatalogDto } from "./role-catalog.dto";
import { buildAccessMatrixDto } from "../access/access-matrix.dto";
import { buildPolicyReview } from "../access/policy-review";

export const PERMISSION_LINEAGE_VERSION = "3.7-h11-lineage-1" as const;

export type LineageEntry = {
  id: string;
  label: string;
  detail: string;
};

export type InheritedAccessEntry = {
  roleId: string;
  inheritsFrom: string[];
  explanation: string;
};

export type PermissionLineage = {
  version: typeof PERMISSION_LINEAGE_VERSION;
  lineageId: string;
  roleLineage: LineageEntry[];
  permissionLineage: LineageEntry[];
  resourceLineage: LineageEntry[];
  inheritedAccess: InheritedAccessEntry[];
  readonlyExplanations: string[];
  summary: string;
};

const INHERITANCE_MAP: Record<string, string[]> = {
  "enterprise-admin": ["release-reviewer", "audit-reviewer", "ops-viewer"],
  "release-reviewer": ["ops-viewer"],
  "audit-reviewer": ["ops-viewer"],
  "ops-viewer": [],
};

export function buildPermissionLineage(input?: { deploymentId?: string }): PermissionLineage {
  const deploymentId = input?.deploymentId ?? "permission-lineage";
  const lineageId = `LIN-V37H11-${deploymentId.slice(0, 8)}`;
  const catalog = buildRoleCatalogDto({ deploymentId });
  const matrix = buildAccessMatrixDto({ deploymentId });
  const review = buildPolicyReview({ deploymentId });

  const roleLineage: LineageEntry[] = catalog.entries.map((entry) => ({
    id: entry.roleId,
    label: entry.roleName,
    detail: `scope=${entry.governanceScope} resources=${entry.accessibleResources.length} readonly=${entry.readonlyAccess}`,
  }));

  const permissionLineage: LineageEntry[] = matrix.permissions
    .filter((p) => p.granted)
    .map((p) => ({
      id: `${p.roleId}:${p.resourceId}`,
      label: `${p.action}:${p.resourceId}`,
      detail: `role=${p.roleId} granted=${p.granted}`,
    }));

  const resourceLineage: LineageEntry[] = matrix.resources.map((resource) => {
    const grantCount = matrix.permissions.filter((p) => p.resourceId === resource.id && p.granted).length;
    return {
      id: resource.id,
      label: resource.label,
      detail: `href=${resource.href ?? "n/a"} grants=${grantCount}`,
    };
  });

  const inheritedAccess: InheritedAccessEntry[] = catalog.entries.map((entry) => {
    const inheritsFrom = INHERITANCE_MAP[entry.roleId] ?? [];
    return {
      roleId: entry.roleId,
      inheritsFrom,
      explanation:
        inheritsFrom.length > 0
          ? `${entry.roleName} inherits baseline from ${inheritsFrom.join(", ")} (static catalog).`
          : `${entry.roleName} is a root readonly role (static catalog).`,
    };
  });

  const readonlyExplanations = review.effectiveAccess
    .filter((e) => e.granted)
    .map((e) => e.explanation);

  return {
    version: PERMISSION_LINEAGE_VERSION,
    lineageId,
    roleLineage,
    permissionLineage,
    resourceLineage,
    inheritedAccess,
    readonlyExplanations,
    summary: `permission-lineage id=${lineageId} roles=${roleLineage.length} permissions=${permissionLineage.length} resources=${resourceLineage.length} explanations=${readonlyExplanations.length}`,
  };
}
