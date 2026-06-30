/**
 * V64 P3 — Feature matrix builder (catalog + gating metadata)
 */
import { buildCommercialFeatureMatrix } from "./feature.matrix";
import { buildPlanFeatureMappings } from "./feature.plan-map";
import { buildTierEntitlementMappings } from "./feature.entitlement-map";
import { buildExposedCapabilities } from "./feature.exposure";
import type { CommercialFeatureGatingMatrix } from "./feature.types";
import { V64_FEATURE_MATRIX_LAYER_VERSION } from "./feature.types";

export function buildCommercialFeatureGatingMatrix(input?: {
  deploymentId?: string;
}): CommercialFeatureGatingMatrix {
  const deploymentId = input?.deploymentId ?? "v64-feature-matrix-default";
  const catalogMatrix = buildCommercialFeatureMatrix({ deploymentId });
  const planFeatureMap = buildPlanFeatureMappings({ deploymentId });
  const tierEntitlements = buildTierEntitlementMappings();
  const exposedCapabilities = buildExposedCapabilities();

  return {
    version: V64_FEATURE_MATRIX_LAYER_VERSION,
    matrixId: `feature-gating-matrix-${deploymentId}`,
    catalogMatrix,
    planFeatureMap,
    tierEntitlements,
    exposedCapabilities,
    summary: [
      `feature-gating-matrix plans=${planFeatureMap.length}`,
      `features=${catalogMatrix.features.length}`,
      `capabilities=${exposedCapabilities.length}`,
    ].join(" "),
  };
}
