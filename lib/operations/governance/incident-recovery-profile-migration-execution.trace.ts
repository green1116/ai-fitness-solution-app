import type { GovernanceIncidentRecoveryProfileMigrationExecutionResult } from "./incident-recovery-profile-migration-execution.types";

export function buildIncidentRecoveryProfileMigrationExecutionTrace(input: {
  deploymentId: string;
  mode: GovernanceIncidentRecoveryProfileMigrationExecutionResult["mode"];
  selectedRuleId: string;
  appliedSteps: string[];
  warnings: string[];
  fallbackUsed: boolean;
}): GovernanceIncidentRecoveryProfileMigrationExecutionResult["trace"] {
  return {
    traceId: `incident-profile-migration-execution-trace-${input.deploymentId}`,
    mode: input.mode,
    selectedRuleId: input.selectedRuleId,
    appliedSteps: input.appliedSteps,
    warnings: input.warnings,
    fallback: input.fallbackUsed ? ["execution fallback enabled"] : [],
  };
}
