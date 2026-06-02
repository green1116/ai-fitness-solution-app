import type {
  GovernanceIncidentRecoveryProfileConfigAdapter,
  GovernanceIncidentRecoveryProfileConfigSource,
} from "./incident-recovery-profile-config.types";

export function adaptIncidentRecoveryProfileConfigSource(
  source: GovernanceIncidentRecoveryProfileConfigSource,
): GovernanceIncidentRecoveryProfileConfigAdapter {
  const warnings: string[] = [];
  const normalizedProfiles = source.inlineProfiles.filter((profile) => {
    const valid = profile.profileId.length > 0 && profile.profileName.length > 0;
    if (!valid) warnings.push(`Invalid profile ignored: ${profile.profileId || "unknown"}`);
    return valid;
  });

  return {
    adapterId: `adapter-${source.sourceId}`,
    adapted: normalizedProfiles.length > 0 || source.type === "builtinFallback",
    normalizedProfiles,
    warnings,
  };
}
