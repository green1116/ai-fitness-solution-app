/**
 * V64 P4 — Commercial capability snapshot builder
 */
import { buildCommercialCapabilityBundle } from "./capability.builder";
import type { CommercialCapabilitySnapshot } from "./capability.types";
import { V64_CAPABILITY_LAYER_VERSION } from "./capability.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialCapabilitySnapshot(input?: {
  deploymentId?: string;
}): CommercialCapabilitySnapshot {
  const deploymentId = input?.deploymentId ?? "v64-capability-layer-default";
  const bundle = buildCommercialCapabilityBundle({ deploymentId });

  return {
    version: V64_CAPABILITY_LAYER_VERSION,
    snapshotId: `capability-snapshot-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    bundle,
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
    summary: [
      `capability-snapshot tiers=${bundle.tierAggregates.length}`,
      `capabilities=${bundle.allExposedCapabilities.length}`,
    ].join(" "),
  };
}
