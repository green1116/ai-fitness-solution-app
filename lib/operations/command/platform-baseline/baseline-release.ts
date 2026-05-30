import type {
  CommandCapabilityInventoryEntry,
  CommandPlatformBaselineRuntimeInput,
  CommandReleaseBaseline,
} from "./baseline-types";
import { COMMAND_PLATFORM_BASELINE_VERSION } from "./baseline-types";
import {
  computeCommandManifestDigest,
  COMMAND_PLATFORM_BASELINE_VERIFY_GROUPS,
  COMMAND_PLATFORM_FROZEN_LAYERS,
} from "./baseline-registry";

export function buildCommandReleaseBaseline(input: {
  runtimeInput: CommandPlatformBaselineRuntimeInput;
  inventory: CommandCapabilityInventoryEntry[];
}): CommandReleaseBaseline {
  const frozenAt = new Date().toISOString();
  const manifestDigest = computeCommandManifestDigest(
    input.inventory.filter((entry) => entry.present).map((entry) => `${entry.capabilityId}@${entry.version}`),
  );

  return {
    baselineId: `command-platform-baseline-${input.runtimeInput.deploymentId}`,
    releaseTag: "V4-A5-FINAL",
    platformVersion: input.runtimeInput.platformVersion,
    baselineVersion: COMMAND_PLATFORM_BASELINE_VERSION,
    frozen: true,
    frozenAt,
    capabilityCount: input.inventory.length,
    manifestDigest,
    verifyGroups: [...COMMAND_PLATFORM_BASELINE_VERIFY_GROUPS],
    frozenLayers: [...COMMAND_PLATFORM_FROZEN_LAYERS],
  };
}
