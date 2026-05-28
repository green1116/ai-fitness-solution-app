import type { GovernanceIncidentRecoveryProfile } from "./incident-recovery-profile.types";
import type {
  GovernanceIncidentRecoveryProfileJsonSourceMergeResult,
  GovernanceIncidentRecoveryProfileJsonSourceSchema,
} from "./incident-recovery-profile-config.json-source.types";

export function mergeIncidentRecoveryProfileJsonSource(input: {
  schema: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
  builtinProfiles: GovernanceIncidentRecoveryProfile[];
}): GovernanceIncidentRecoveryProfileJsonSourceMergeResult {
  if (!input.schema) {
    return {
      mergedProfiles: input.builtinProfiles,
      conflicts: [],
      overrideHit: false,
    };
  }
  const merged = new Map<string, GovernanceIncidentRecoveryProfile>();
  for (const profile of input.builtinProfiles) merged.set(profile.profileId, profile);

  const conflicts: string[] = [];
  for (const profile of input.schema.profiles) {
    const existing = merged.get(profile.profileId);
    if (existing) {
      conflicts.push(`Conflict ${profile.profileId}: builtin(${existing.priority}) vs json(${profile.priority})`);
      if (profile.priority >= existing.priority) merged.set(profile.profileId, profile);
      continue;
    }
    merged.set(profile.profileId, profile);
  }

  return {
    mergedProfiles: [...merged.values()],
    conflicts,
    overrideHit: conflicts.length > 0,
  };
}
