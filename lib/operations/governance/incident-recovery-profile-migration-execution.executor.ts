import type {
  GovernanceIncidentRecoveryProfileMigrationExecutionFallback,
  GovernanceIncidentRecoveryProfileMigrationExecutionPlan,
  GovernanceIncidentRecoveryProfileMigrationExecutionStatus,
} from "./incident-recovery-profile-migration-execution.types";

export function executeIncidentRecoveryProfileMigrationPlan(input: {
  plan: GovernanceIncidentRecoveryProfileMigrationExecutionPlan;
  fallback: GovernanceIncidentRecoveryProfileMigrationExecutionFallback;
}): {
  appliedSteps: string[];
  warnings: string[];
  status: GovernanceIncidentRecoveryProfileMigrationExecutionStatus;
} {
  const appliedSteps =
    input.plan.mode === "dry-run"
      ? input.plan.orderedSteps.map((s) => `${s.stepId}:dry-run`)
      : input.plan.orderedSteps.filter((s) => s.applied).map((s) => s.stepId);
  const warnings: string[] = [];
  if (input.fallback.used) warnings.push("fallback applied during execution");
  const status: GovernanceIncidentRecoveryProfileMigrationExecutionStatus =
    input.plan.mode === "dry-run"
      ? "dryRun"
      : input.fallback.used
        ? "fallback"
        : appliedSteps.length === input.plan.orderedSteps.length
          ? "executed"
          : "partial";
  return { appliedSteps, warnings, status };
}
