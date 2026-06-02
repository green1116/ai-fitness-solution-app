import type { GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult } from "./incident-recovery-profile-migration-rule-registry.types";

export function summarizeIncidentRecoveryProfileMigrationRuleRegistry(
  result: Omit<GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult, "summary">,
): GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult["summary"] {
  return {
    summaryId: `incident-profile-migration-rule-summary-${Date.now()}`,
    text: `selected=${result.snapshot.selectedRuleId} source=${result.snapshot.sourceVersion} target=${result.snapshot.targetVersion} matched=${result.matches.filter((m) => m.matched).length} status=${result.status}`,
    traceId: result.trace.traceId,
  };
}
