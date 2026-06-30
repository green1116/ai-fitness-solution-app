/**
 * V64 P6 — Commercial transition snapshot builder
 */
import { buildCommercialTransitionBundle } from "./transition.builder";
import type { CommercialTransitionSnapshot } from "./transition.types";
import { V64_TRANSITION_LAYER_VERSION } from "./transition.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialTransitionSnapshot(input?: {
  deploymentId?: string;
}): CommercialTransitionSnapshot {
  const deploymentId = input?.deploymentId ?? "v64-transition-layer-default";
  const bundle = buildCommercialTransitionBundle({ deploymentId });

  return {
    version: V64_TRANSITION_LAYER_VERSION,
    snapshotId: `transition-snapshot-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    bundle,
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
    summary: [
      `transition-snapshot upgrades=${bundle.upgradePaths.length}`,
      `downgrades=${bundle.downgradePaths.length}`,
    ].join(" "),
  };
}
