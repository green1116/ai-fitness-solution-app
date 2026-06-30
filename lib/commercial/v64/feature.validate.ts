/**
 * V64 P3 — Feature matrix validation (read-only invariants)
 */
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { PLAN_FEATURE_MATRIX } from "@/lib/feature-flags/feature.service";
import { validatePackaging } from "@/lib/productization/catalog";

import { buildCommercialFeatureGatingMatrix } from "./feature.builder";
import { buildCommercialFeatureMatrixSnapshot } from "./feature.snapshot";
import type {
  CommercialFeatureGatingMatrix,
  CommercialFeatureMatrixSnapshot,
  CommercialFeatureMatrixValidation,
} from "./feature.types";

function validateGatingMatrix(matrix: CommercialFeatureGatingMatrix): CommercialFeatureMatrixValidation {
  const catalogMatrixOk =
    matrix.catalogMatrix.features.length >= 7 && matrix.catalogMatrix.tiers.length === 3;

  const planFeatureMapOk =
    matrix.planFeatureMap.length === 3 &&
    matrix.planFeatureMap.every((row) => row.featureIds.length > 0 && row.featureKeys.length > 0);

  const tierEntitlementsOk =
    matrix.tierEntitlements.length === 3 &&
    matrix.tierEntitlements.every(
      (row) => row.catalogFeatures.length > 0 && row.billingEntitlement.tier === row.productTier,
    );

  const capabilitiesExposedOk =
    matrix.exposedCapabilities.length >= 7 &&
    matrix.exposedCapabilities.every((cap) => cap.commercialLabel.length > 0);

  const runtimeMatrixAligned = matrix.planFeatureMap.every((row) => {
    const flags = PLAN_FEATURE_MATRIX[row.saasPlan];
    const expected = (Object.keys(flags) as FeatureKey[]).filter((k) => flags[k]);
    const actual = [...row.runtimeFeatureFlags].sort();
    const exp = [...expected].sort();
    return exp.length === actual.length && exp.every((k, i) => k === actual[i]);
  });

  const packaging = validatePackaging();
  const backwardCompatible = packaging.packagingValid && catalogMatrixOk;

  const featureMatrixOk =
    catalogMatrixOk &&
    planFeatureMapOk &&
    tierEntitlementsOk &&
    capabilitiesExposedOk &&
    runtimeMatrixAligned &&
    backwardCompatible;

  return {
    catalogMatrixOk,
    planFeatureMapOk,
    tierEntitlementsOk,
    capabilitiesExposedOk,
    runtimeMatrixAligned,
    backwardCompatible,
    featureMatrixOk,
  };
}

export function validateCommercialFeatureMatrix(input?: {
  deploymentId?: string;
}): CommercialFeatureMatrixValidation {
  const matrix = buildCommercialFeatureGatingMatrix(input);
  return validateGatingMatrix(matrix);
}

export function validateCommercialFeatureMatrixSnapshot(
  snapshot: CommercialFeatureMatrixSnapshot,
): CommercialFeatureMatrixValidation {
  return validateGatingMatrix(snapshot.gatingMatrix);
}
