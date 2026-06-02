/**
 * V3.7-H9 Production Access Control Foundation
 */

export {
  ACCESS_MATRIX_DTO_VERSION,
  buildAccessMatrixDto,
  type AccessMatrixDto,
  type AccessRole,
  type AccessResource,
  type AccessPermission,
  type AccessRule,
} from "./access-matrix.dto";

export {
  POLICY_REVIEW_VERSION,
  buildPolicyReview,
  type PolicyReview,
  type EffectiveAccessEntry,
} from "./policy-review";

export {
  ACCESS_MATRIX_VERSION,
  buildAccessMatrix,
  buildAccessMatrixSummary,
  type AccessMatrix,
} from "./access-matrix";

export {
  ACCESS_MANIFEST_VERSION,
  buildAccessManifest,
  type AccessManifest,
} from "./access-manifest";

export const PRODUCTION_ACCESS_CONTROL_VERSION = "3.7-h9-foundation-1" as const;

import { buildAccessMatrixDto, type AccessMatrixDto } from "./access-matrix.dto";
import { buildPolicyReview, type PolicyReview } from "./policy-review";
import { buildAccessMatrix, type AccessMatrix } from "./access-matrix";
import { buildAccessManifest, type AccessManifest } from "./access-manifest";

export type ProductionAccessControlFoundation = {
  version: typeof PRODUCTION_ACCESS_CONTROL_VERSION;
  foundationId: string;
  dto: AccessMatrixDto;
  policyReview: PolicyReview;
  matrix: AccessMatrix;
  manifest: AccessManifest;
  summary: string;
};

export function buildProductionAccessControlFoundation(input?: {
  deploymentId?: string;
}): ProductionAccessControlFoundation {
  const deploymentId = input?.deploymentId ?? "access-control-foundation";
  const foundationId = `PAC-V37H9-${deploymentId.slice(0, 8)}`;
  const dto = buildAccessMatrixDto({ deploymentId });
  const policyReview = buildPolicyReview({ deploymentId });
  const matrix = buildAccessMatrix({ deploymentId });
  const manifest = buildAccessManifest({ deploymentId });

  return {
    version: PRODUCTION_ACCESS_CONTROL_VERSION,
    foundationId,
    dto,
    policyReview,
    matrix,
    manifest,
    summary: `production-access-control id=${foundationId} readyForReview=${manifest.readyForReview} roles=${dto.roles.length} resources=${dto.resources.length} granted=${matrix.grantedCount}`,
  };
}
