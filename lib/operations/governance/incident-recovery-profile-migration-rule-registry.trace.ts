import type { GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult } from "./incident-recovery-profile-migration-rule-registry.types";

export function buildIncidentRecoveryProfileMigrationRuleRegistryTrace(input: {
  deploymentId: string;
  matches: GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult["matches"];
  selectedRuleId: string;
  fallbackUsed: boolean;
}): GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult["trace"] {
  return {
    traceId: `incident-profile-migration-rule-trace-${input.deploymentId}`,
    candidateRules: input.matches.map((m) => m.ruleId),
    matchedRules: input.matches.filter((m) => m.matched).map((m) => m.ruleId),
    rejectedRules: input.matches.filter((m) => !m.matched).map((m) => m.ruleId),
    execution: [`selectedRule=${input.selectedRuleId}`],
    fallback: input.fallbackUsed ? ["fallback rule executed"] : [],
  };
}
