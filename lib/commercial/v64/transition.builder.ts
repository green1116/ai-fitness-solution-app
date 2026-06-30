/**
 * V64 P6 — Commercial transition builder
 */
import { buildTierCompatibilityMatrix } from "./transition.compatibility";
import { buildDowngradePathMap, buildUpgradePathMap } from "./transition.paths";
import type { CommercialTransitionBundle } from "./transition.types";
import { V64_TRANSITION_LAYER_VERSION } from "./transition.types";

export function buildCommercialTransitionBundle(input?: {
  deploymentId?: string;
}): CommercialTransitionBundle {
  const deploymentId = input?.deploymentId ?? "v64-transition-layer-default";
  const upgradePaths = buildUpgradePathMap();
  const downgradePaths = buildDowngradePathMap();
  const compatibilityMatrix = buildTierCompatibilityMatrix({ deploymentId });

  return {
    version: V64_TRANSITION_LAYER_VERSION,
    bundleId: `transition-bundle-${deploymentId}`,
    upgradePaths,
    downgradePaths,
    compatibilityMatrix,
    summary: [
      `transition-bundle upgrades=${upgradePaths.length}`,
      `downgrades=${downgradePaths.length}`,
    ].join(" "),
  };
}
