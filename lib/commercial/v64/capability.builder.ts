/**
 * V64 P4 — Commercial capability builder
 */
import { buildCapabilityMap } from "./capability.map";
import { buildAllTierCapabilityAggregates } from "./capability.aggregate";
import { buildExposedCapabilities } from "./feature.exposure";
import type { CommercialCapabilityBundle } from "./capability.types";
import { V64_CAPABILITY_LAYER_VERSION } from "./capability.types";

export function buildCommercialCapabilityBundle(input?: {
  deploymentId?: string;
}): CommercialCapabilityBundle {
  const deploymentId = input?.deploymentId ?? "v64-capability-layer-default";
  const foundationMap = buildCapabilityMap({ deploymentId });
  const tierAggregates = buildAllTierCapabilityAggregates();
  const allExposedCapabilities = buildExposedCapabilities();

  return {
    version: V64_CAPABILITY_LAYER_VERSION,
    bundleId: `capability-bundle-${deploymentId}`,
    foundationMap,
    tierAggregates,
    allExposedCapabilities,
    summary: [
      `capability-bundle tiers=${tierAggregates.length}`,
      `exposed=${allExposedCapabilities.length}`,
      `bindings=${foundationMap.tiers[0]?.capabilities.length ?? 0}`,
    ].join(" "),
  };
}
