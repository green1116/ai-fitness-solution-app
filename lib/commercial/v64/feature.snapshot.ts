/**
 * V64 P3 — Feature matrix snapshot builder
 */
import { buildCommercialFeatureGatingMatrix } from "./feature.builder";
import type { CommercialFeatureMatrixSnapshot } from "./feature.types";
import { V64_FEATURE_MATRIX_LAYER_VERSION } from "./feature.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialFeatureMatrixSnapshot(input?: {
  deploymentId?: string;
}): CommercialFeatureMatrixSnapshot {
  const deploymentId = input?.deploymentId ?? "v64-feature-matrix-default";
  const gatingMatrix = buildCommercialFeatureGatingMatrix({ deploymentId });

  return {
    version: V64_FEATURE_MATRIX_LAYER_VERSION,
    snapshotId: `feature-matrix-snapshot-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    gatingMatrix,
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
    summary: [
      `feature-matrix-snapshot plans=${gatingMatrix.planFeatureMap.length}`,
      `capabilities=${gatingMatrix.exposedCapabilities.length}`,
    ].join(" "),
  };
}
