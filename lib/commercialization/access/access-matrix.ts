/**
 * V3.7-H9 Production Access — access matrix builder (readonly aggregation)
 */

import { buildAccessMatrixDto, type AccessMatrixDto } from "./access-matrix.dto";
import { buildPolicyReview, type PolicyReview } from "./policy-review";

export const ACCESS_MATRIX_VERSION = "3.7-h9-matrix-1" as const;

export type AccessMatrix = {
  version: typeof ACCESS_MATRIX_VERSION;
  matrixId: string;
  defaultRole: string;
  roleCount: number;
  resourceCount: number;
  grantedCount: number;
  dto: AccessMatrixDto;
  policyReview: PolicyReview;
  summary: string;
};

export function buildAccessMatrix(input?: { deploymentId?: string }): AccessMatrix {
  const deploymentId = input?.deploymentId ?? "access-matrix";
  const matrixId = `MAT-V37H9-${deploymentId.slice(0, 8)}`;
  const dto = buildAccessMatrixDto({ deploymentId });
  const policyReview = buildPolicyReview({ deploymentId });
  const grantedCount = dto.permissions.filter((p) => p.granted).length;

  return {
    version: ACCESS_MATRIX_VERSION,
    matrixId,
    defaultRole: dto.defaultRole,
    roleCount: dto.roles.length,
    resourceCount: dto.resources.length,
    grantedCount,
    dto,
    policyReview,
    summary: `access-matrix id=${matrixId} roles=${dto.roles.length} resources=${dto.resources.length} granted=${grantedCount} defaultRole=${dto.defaultRole}`,
  };
}

export function buildAccessMatrixSummary(input?: { deploymentId?: string }): string {
  return buildAccessMatrix(input).summary;
}
