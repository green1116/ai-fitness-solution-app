/**
 * V3.7-H9 Production Access — policy review builder (readonly aggregation)
 */

import { buildAccessMatrixDto, type AccessMatrixDto } from "./access-matrix.dto";
import { buildLedgerAccessPolicy } from "../ops/ledger-access-policy";

export const POLICY_REVIEW_VERSION = "3.7-h9-policy-review-1" as const;

export type EffectiveAccessEntry = {
  resourceId: string;
  roleId: string;
  granted: boolean;
  explanation: string;
};

export type PolicyReview = {
  version: typeof POLICY_REVIEW_VERSION;
  reviewId: string;
  roleSummary: string;
  resourceSummary: string;
  permissionSummary: string;
  denySummary: string;
  allowSummary: string;
  effectiveAccess: EffectiveAccessEntry[];
  summary: string;
};

function buildEffectiveAccess(dto: AccessMatrixDto): EffectiveAccessEntry[] {
  return dto.permissions.map((permission) => {
    const role = dto.roles.find((r) => r.id === permission.roleId);
    const resource = dto.resources.find((r) => r.id === permission.resourceId);
    const explanation = permission.granted
      ? `${role?.label ?? permission.roleId} may view ${resource?.label ?? permission.resourceId} (readonly static policy).`
      : `${role?.label ?? permission.roleId} cannot view ${resource?.label ?? permission.resourceId} (static deny).`;

    return {
      resourceId: permission.resourceId,
      roleId: permission.roleId,
      granted: permission.granted,
      explanation,
    };
  });
}

export function buildPolicyReview(input?: { deploymentId?: string }): PolicyReview {
  const deploymentId = input?.deploymentId ?? "policy-review";
  const reviewId = `PRV-V37H9-${deploymentId.slice(0, 8)}`;
  const dto = buildAccessMatrixDto({ deploymentId });
  const policy = buildLedgerAccessPolicy({ deploymentId });
  const effectiveAccess = buildEffectiveAccess(dto);
  const grantedCount = effectiveAccess.filter((e) => e.granted).length;

  return {
    version: POLICY_REVIEW_VERSION,
    reviewId,
    roleSummary: `roles=${dto.roles.length} default=${dto.defaultRole}`,
    resourceSummary: `resources=${dto.resources.length} portal-readonly`,
    permissionSummary: `permissions=${dto.permissions.length} granted=${grantedCount}`,
    denySummary: `denyRules=${dto.denyRules.length}`,
    allowSummary: `allowRules=${dto.allowRules.length} ledger=${policy.canViewReleaseLedger} evidence=${policy.canViewEvidenceExport}`,
    effectiveAccess,
    summary: `policy-review id=${reviewId} roles=${dto.roles.length} resources=${dto.resources.length} granted=${grantedCount} deny=${dto.denyRules.length} allow=${dto.allowRules.length}`,
  };
}
