import type {
  GovernanceIncidentRecoveryProfileMigrationExecutionFallback,
  GovernanceIncidentRecoveryProfileMigrationExecutionInput,
  GovernanceIncidentRecoveryProfileMigrationExecutionPlan,
} from "./incident-recovery-profile-migration-execution.types";

export function resolveIncidentRecoveryProfileMigrationExecutionFallback(input: {
  runtime: GovernanceIncidentRecoveryProfileMigrationExecutionInput;
  plan: GovernanceIncidentRecoveryProfileMigrationExecutionPlan;
}): GovernanceIncidentRecoveryProfileMigrationExecutionFallback {
  if (input.plan.mode === "dry-run") {
    return {
      used: false,
      reason: "dry-run mode does not mutate canonical payload",
      fallbackTarget: "evolution",
    };
  }
  if (input.runtime.registry.status === "fallback" || input.runtime.evolution.status === "fallback") {
    return {
      used: true,
      reason: "registry/evolution fallback requested",
      fallbackTarget: "builtin",
    };
  }
  return {
    used: false,
    reason: "execution plan can proceed without fallback",
    fallbackTarget: "evolution",
  };
}
