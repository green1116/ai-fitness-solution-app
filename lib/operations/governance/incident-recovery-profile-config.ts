import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
  type GovernanceIncidentRecoveryProfileConfigInput,
  type GovernanceIncidentRecoveryProfileConfigResult,
} from "./incident-recovery-profile-config.types";
import { loadIncidentRecoveryProfileConfigSource } from "./incident-recovery-profile-config.loader";
import { adaptIncidentRecoveryProfileConfigSource } from "./incident-recovery-profile-config.adapter";
import { mergeIncidentRecoveryProfiles } from "./incident-recovery-profile-config.merge";
import { resolveIncidentRecoveryProfileConfig } from "./incident-recovery-profile-config.resolver";
import { buildIncidentRecoveryProfileConfigRegistry } from "./incident-recovery-profile-config.registry";
import { buildIncidentRecoveryProfileConfigTrace } from "./incident-recovery-profile-config.trace";
import { summarizeIncidentRecoveryProfileConfig } from "./incident-recovery-profile-config.summary";

export function buildIncidentRecoveryProfileConfigRuntime(
  input: GovernanceIncidentRecoveryProfileConfigInput,
): GovernanceIncidentRecoveryProfileConfigResult {
  const source = loadIncidentRecoveryProfileConfigSource(input);
  const adapter = adaptIncidentRecoveryProfileConfigSource(source);
  const merged = mergeIncidentRecoveryProfiles({
    source,
    builtinProfiles: input.incidentRecoveryProfile.registry.profiles,
    externalProfiles: adapter.normalizedProfiles,
  });
  const resolver = resolveIncidentRecoveryProfileConfig({
    source,
    mergedProfiles: merged.merged,
    builtinProfile: input.incidentRecoveryProfile.snapshot,
  });
  const registry = buildIncidentRecoveryProfileConfigRegistry({
    selectedSource: source,
  });
  const status: GovernanceIncidentRecoveryProfileConfigResult["status"] =
    source.type === "builtinFallback"
      ? "fallback"
      : adapter.normalizedProfiles.length === 0
        ? "invalidExternalConfig"
        : "resolved";
  const trace = buildIncidentRecoveryProfileConfigTrace({
    sourceType: source.type,
    adapter,
    mergeTrace: merged.trace,
    resolver,
    fallbackUsed: merged.fallbackUsed || source.type === "builtinFallback",
  });

  const core: Omit<GovernanceIncidentRecoveryProfileConfigResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
    status,
    snapshot: {
      sourceType: source.type,
      profileVersion: source.profileVersion,
      selectedProfileId: resolver.selectedProfileId,
      mergedCount: merged.merged.length,
      fallbackUsed: trace.fallbackUsed,
    },
    source,
    resolved: resolver,
    merged: merged.merged,
    registry,
    trace,
  };

  return {
    ...core,
    summary: summarizeIncidentRecoveryProfileConfig(core),
  };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION };
