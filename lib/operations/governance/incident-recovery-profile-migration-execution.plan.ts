import type {
  GovernanceIncidentRecoveryProfileMigrationExecutionInput,
  GovernanceIncidentRecoveryProfileMigrationExecutionPlan,
} from "./incident-recovery-profile-migration-execution.types";

export function planIncidentRecoveryProfileMigrationExecution(
  input: GovernanceIncidentRecoveryProfileMigrationExecutionInput,
): GovernanceIncidentRecoveryProfileMigrationExecutionPlan {
  const mode =
    input.mode ??
    (input.renderingPolicy.mode === "audit"
      ? "audit"
      : input.renderingPolicy.mode === "compat"
        ? "compat"
        : "strict");
  return {
    planId: `incident-profile-migration-plan-${input.deploymentId}`,
    mode,
    selectedRuleId: input.registry.snapshot.selectedRuleId,
    orderedSteps: [
      {
        stepId: "step-1-version-normalize",
        action: "normalizeVersion",
        target: "schema.version",
        applied: true,
        reason: "normalize to canonical version",
      },
      {
        stepId: "step-2-alias-rename",
        action: "renameField",
        target: "legacy aliases",
        applied: true,
        reason: "canonicalize legacy aliases",
      },
      {
        stepId: "step-3-default-injection",
        action: "injectDefault",
        target: "optional fields",
        applied: true,
        reason: "ensure canonical payload completeness",
      },
    ],
  };
}
