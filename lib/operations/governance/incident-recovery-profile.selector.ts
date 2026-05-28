import type {
  GovernanceIncidentRecoveryProfile,
  GovernanceIncidentRecoveryProfileMatch,
} from "./incident-recovery-profile.types";

export function selectIncidentRecoveryProfile(input: {
  profiles: GovernanceIncidentRecoveryProfile[];
  matches: GovernanceIncidentRecoveryProfileMatch[];
}): GovernanceIncidentRecoveryProfile {
  const scoreById = new Map(input.matches.map((m) => [m.profileId, m.score]));
  const sorted = [...input.profiles]
    .filter((p) => p.enabled)
    .sort((a, b) => {
      const scoreDiff = (scoreById.get(b.profileId) ?? 0) - (scoreById.get(a.profileId) ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return b.priority - a.priority;
    });
  return sorted[0];
}
