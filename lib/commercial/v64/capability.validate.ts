/**
 * V64 P4 — Commercial capability validation (read-only invariants)
 */
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { PLAN_FEATURE_MATRIX } from "@/lib/feature-flags/feature.service";
import { validateCommercialFeatureMatrix } from "./feature.validate";

import { buildCommercialCapabilityBundle } from "./capability.builder";
import { buildCommercialCapabilitySnapshot } from "./capability.snapshot";
import type {
  CommercialCapabilityBundle,
  CommercialCapabilitySnapshot,
  CommercialCapabilityValidation,
} from "./capability.types";

function validateBundle(bundle: CommercialCapabilityBundle): CommercialCapabilityValidation {
  const foundationMapOk =
    bundle.foundationMap.tiers.length === 3 &&
    bundle.foundationMap.tiers.every((row) => row.capabilities.length >= 7);

  const tierAggregatesOk =
    bundle.tierAggregates.length === 3 &&
    bundle.tierAggregates.every(
      (row) => row.enabledCapabilityCount > 0 && row.featureFlags.length > 0,
    );

  const exposureOk =
    bundle.allExposedCapabilities.length >= 7 &&
    bundle.tierAggregates.every((row) =>
      row.enabledCapabilities.every((cap) => cap.enabledByTier[row.productTier]),
    );

  const runtimeAligned = bundle.tierAggregates.every((row) => {
    const flags = PLAN_FEATURE_MATRIX[row.saasPlan];
    const expected = (Object.keys(flags) as FeatureKey[]).filter((k) => flags[k]);
    const actual = [...row.featureFlags].sort();
    const exp = [...expected].sort();
    return exp.length === actual.length && exp.every((k, i) => k === actual[i]);
  });

  const featureValidation = validateCommercialFeatureMatrix();
  const backwardCompatible = featureValidation.backwardCompatible && foundationMapOk;

  const capabilityOk =
    foundationMapOk &&
    tierAggregatesOk &&
    exposureOk &&
    runtimeAligned &&
    backwardCompatible;

  return {
    foundationMapOk,
    tierAggregatesOk,
    exposureOk,
    runtimeAligned,
    backwardCompatible,
    capabilityOk,
  };
}

export function validateCommercialCapability(input?: {
  deploymentId?: string;
}): CommercialCapabilityValidation {
  const bundle = buildCommercialCapabilityBundle(input);
  return validateBundle(bundle);
}

export function validateCommercialCapabilitySnapshot(
  snapshot: CommercialCapabilitySnapshot,
): CommercialCapabilityValidation {
  return validateBundle(snapshot.bundle);
}
