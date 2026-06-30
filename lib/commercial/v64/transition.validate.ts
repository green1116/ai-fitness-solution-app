/**
 * V64 P6 — Commercial transition validation (read-only invariants)
 */
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { PLAN_FEATURE_MATRIX } from "@/lib/feature-flags/feature.service";

import { validateCommercialFoundation } from "./foundation";
import { buildCommercialTransitionBundle } from "./transition.builder";
import { buildCommercialTransitionSnapshot } from "./transition.snapshot";
import type {
  CommercialTransitionBundle,
  CommercialTransitionSnapshot,
  CommercialTransitionValidation,
} from "./transition.types";

function validateBundle(bundle: CommercialTransitionBundle): CommercialTransitionValidation {
  const upgradePathsOk = bundle.upgradePaths.length === 3;
  const downgradePathsOk = bundle.downgradePaths.length === 3;

  const compatibilityOk =
    bundle.compatibilityMatrix.cells.length === 9 &&
    bundle.compatibilityMatrix.cells.filter((c) => c.kind === "same").length === 3;

  const runtimeAligned = bundle.upgradePaths.every((path) => {
    const fromFlags = PLAN_FEATURE_MATRIX[path.fromSaasPlan];
    const toFlags = PLAN_FEATURE_MATRIX[path.toSaasPlan];
    const expectedGained = (Object.keys(toFlags) as FeatureKey[]).filter(
      (k) => toFlags[k] && !fromFlags[k],
    );
    return (
      path.gainedFeatureFlags.length === expectedGained.length &&
      path.monthlyPriceDeltaCny > 0
    );
  });

  const backwardCompatible = validateCommercialFoundation().foundationOk;

  const transitionOk =
    upgradePathsOk &&
    downgradePathsOk &&
    compatibilityOk &&
    runtimeAligned &&
    backwardCompatible;

  return {
    upgradePathsOk,
    downgradePathsOk,
    compatibilityOk,
    runtimeAligned,
    backwardCompatible,
    transitionOk,
  };
}

export function validateCommercialTransition(input?: {
  deploymentId?: string;
}): CommercialTransitionValidation {
  const bundle = buildCommercialTransitionBundle(input);
  return validateBundle(bundle);
}

export function validateCommercialTransitionSnapshot(
  snapshot: CommercialTransitionSnapshot,
): CommercialTransitionValidation {
  return validateBundle(snapshot.bundle);
}
