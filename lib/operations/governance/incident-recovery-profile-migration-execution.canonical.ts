import type { GovernanceIncidentRecoveryProfile } from "./incident-recovery-profile.types";
import type {
  GovernanceIncidentRecoveryProfileMigrationExecutionCanonical,
  GovernanceIncidentRecoveryProfileMigrationExecutionInput,
} from "./incident-recovery-profile-migration-execution.types";

export function canonicalizeIncidentRecoveryProfileMigration(input: {
  runtime: GovernanceIncidentRecoveryProfileMigrationExecutionInput;
  fallbackUsed: boolean;
}): GovernanceIncidentRecoveryProfileMigrationExecutionCanonical {
  const evolved = input.runtime.evolution.evolvedSchema?.profiles ?? [];
  const profiles: GovernanceIncidentRecoveryProfile[] =
    input.runtime.mode === "dry-run"
      ? input.runtime.builtinProfiles
      : evolved.length > 0
        ? evolved
        : input.runtime.builtinProfiles;
  const first = profiles[0] ?? input.runtime.builtinProfiles[0];
  return {
    canonicalVersion: input.runtime.evolution.evolvedSchema?.version ?? "builtin-canonical",
    canonicalProfileId: first.profileId,
    canonicalProfileName: first.profileName,
    canonicalProfiles: profiles,
    sourceVersion: input.runtime.evolution.snapshot.sourceVersion,
    sourceType: input.runtime.evolution.evolvedSchema ? "jsonLocal" : "builtin",
  };
}
