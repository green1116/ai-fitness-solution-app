import type {
  GovernanceIncidentRecoveryProfileConfigInput,
  GovernanceIncidentRecoveryProfileConfigSource,
} from "./incident-recovery-profile-config.types";

export function loadIncidentRecoveryProfileConfigSource(
  input: GovernanceIncidentRecoveryProfileConfigInput,
): GovernanceIncidentRecoveryProfileConfigSource {
  if (!input.inlineConfig) {
    return {
      sourceId: "source-builtin-fallback",
      type: "builtinFallback",
      enabled: true,
      priority: 1,
      profileVersion: input.incidentRecoveryProfile.version,
      mergeStrategy: "fallback",
      inlineProfiles: [],
      description: "Builtin fallback source for incident recovery profile.",
    };
  }

  return {
    sourceId: "source-inline-config",
    type: input.inlineConfig.sourceType ?? "inline",
    enabled: true,
    priority: 100,
    profileVersion: input.inlineConfig.profileVersion,
    mergeStrategy: input.inlineConfig.mergeStrategy,
    inlineProfiles: input.inlineConfig.profiles,
    description: "Inline profile config source.",
  };
}
