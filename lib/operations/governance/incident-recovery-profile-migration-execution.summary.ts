import type { GovernanceIncidentRecoveryProfileMigrationExecutionResult } from "./incident-recovery-profile-migration-execution.types";

export function summarizeIncidentRecoveryProfileMigrationExecution(
  result: Omit<GovernanceIncidentRecoveryProfileMigrationExecutionResult, "summary">,
): GovernanceIncidentRecoveryProfileMigrationExecutionResult["summary"] {
  return {
    summaryId: `incident-profile-migration-execution-summary-${Date.now()}`,
    text: `mode=${result.mode} status=${result.status} canonicalVersion=${result.canonical.canonicalVersion} canonicalProfile=${result.canonical.canonicalProfileId} fallback=${result.fallback.used} steps=${result.plan.orderedSteps.length}`,
    traceId: result.trace.traceId,
  };
}
