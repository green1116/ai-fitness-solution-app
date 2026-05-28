import type { GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult } from "./incident-recovery-profile-config.json-schema-evolution.types";

export function summarizeIncidentRecoveryProfileJsonSchemaEvolution(
  result: Omit<GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult, "summary">,
): GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult["summary"] {
  return {
    summaryId: `incident-profile-json-schema-evolution-summary-${Date.now()}`,
    text: [
      `sourceVersion=${result.snapshot.sourceVersion}`,
      `targetVersion=${result.snapshot.targetVersion}`,
      `compatibility=${result.compatibility}`,
      `migrations=${result.migrations.length}`,
      `fallback=${result.snapshot.fallbackUsed}`,
      `status=${result.status}`,
    ].join(" "),
    traceId: result.trace.traceId,
  };
}
