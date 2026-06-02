import type {
  GovernanceCapabilityInventoryEntry,
  GovernancePlatformBaselineRuntimeInput,
  GovernanceReleaseBaseline,
} from "./baseline-types";
import { GOVERNANCE_PLATFORM_BASELINE_VERSION } from "./baseline-types";
import {
  computeManifestDigest,
  GOVERNANCE_PLATFORM_BASELINE_VERIFY_GROUPS,
} from "./baseline-registry";

export function buildGovernanceReleaseBaseline(input: {
  runtimeInput: GovernancePlatformBaselineRuntimeInput;
  inventory: GovernanceCapabilityInventoryEntry[];
}): GovernanceReleaseBaseline {
  const frozenAt = new Date().toISOString();
  const manifestDigest = computeManifestDigest(
    input.inventory.filter((entry) => entry.present).map((entry) => `${entry.capabilityId}@${entry.version}`),
  );

  return {
    baselineId: `governance-platform-baseline-${input.runtimeInput.deploymentId}`,
    releaseTag: "V4-A3-FINAL",
    platformVersion: input.runtimeInput.platformVersion,
    baselineVersion: GOVERNANCE_PLATFORM_BASELINE_VERSION,
    frozen: true,
    frozenAt,
    capabilityCount: input.inventory.length,
    manifestDigest,
    verifyGroups: [...GOVERNANCE_PLATFORM_BASELINE_VERIFY_GROUPS],
  };
}
