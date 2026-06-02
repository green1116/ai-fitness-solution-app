import type {
  GovernanceIncidentRecoveryProfile,
  GovernanceIncidentRecoveryProfileMatch,
  GovernanceIncidentRecoveryProfileTrace,
} from "./incident-recovery-profile.types";

export function buildIncidentRecoveryProfileTrace(input: {
  profiles: GovernanceIncidentRecoveryProfile[];
  matches: GovernanceIncidentRecoveryProfileMatch[];
  chosen: GovernanceIncidentRecoveryProfile;
}): GovernanceIncidentRecoveryProfileTrace {
  const matchedProfiles = input.matches.filter((m) => m.matched).map((m) => m.profileId);
  const rejectedProfiles = input.profiles
    .map((p) => p.profileId)
    .filter((id) => id !== input.chosen.profileId);
  const rationale = input.matches.map((m) => `${m.profileId}:${m.reason}`);

  return {
    traceId: `incident-profile-trace-${Date.now()}`,
    candidateProfiles: input.profiles.map((p) => p.profileId),
    matchedProfiles,
    chosenProfile: input.chosen.profileId,
    rejectedProfiles,
    rationale,
  };
}
