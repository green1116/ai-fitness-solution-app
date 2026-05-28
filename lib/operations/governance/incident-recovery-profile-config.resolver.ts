import type {
  GovernanceIncidentRecoveryProfileConfigResolver,
  GovernanceIncidentRecoveryProfileConfigSource,
} from "./incident-recovery-profile-config.types";
import type { GovernanceIncidentRecoveryProfile } from "./incident-recovery-profile.types";

export function resolveIncidentRecoveryProfileConfig(input: {
  source: GovernanceIncidentRecoveryProfileConfigSource;
  mergedProfiles: GovernanceIncidentRecoveryProfile[];
  builtinProfile: GovernanceIncidentRecoveryProfile;
}): GovernanceIncidentRecoveryProfileConfigResolver {
  if (input.source.type === "builtinFallback") {
    return {
      resolverId: `resolver-${input.source.sourceId}`,
      selectedSourceId: input.source.sourceId,
      selectedProfileId: input.builtinProfile.profileId,
      resolvedFrom: "builtin",
      decision: {
        profileId: input.builtinProfile.profileId,
        strategy: input.builtinProfile.strategy,
        requiresManualIntervention: input.builtinProfile.requireManualIntervention,
        degradedMode: input.builtinProfile.allowDegraded,
        partialRecovery: input.builtinProfile.allowPartialRecovery,
      },
    };
  }

  const sameProfile = input.mergedProfiles.find(
    (p) => p.profileId === input.builtinProfile.profileId,
  );
  const higherPriority = input.mergedProfiles.find(
    (p) => p.priority > input.builtinProfile.priority,
  );
  const selected = sameProfile ?? higherPriority ?? input.builtinProfile;

  return {
    resolverId: `resolver-${input.source.sourceId}`,
    selectedSourceId: input.source.sourceId,
    selectedProfileId: selected.profileId,
    resolvedFrom: "external",
    decision: {
      profileId: selected.profileId,
      strategy: selected.strategy,
      requiresManualIntervention: selected.requireManualIntervention,
      degradedMode: selected.allowDegraded,
      partialRecovery: selected.allowPartialRecovery,
    },
  };
}
