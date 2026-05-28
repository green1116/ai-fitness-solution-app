import type { GovernanceIncidentRecoveryProfileConfigResult } from "./incident-recovery-profile-config.types";

export function summarizeIncidentRecoveryProfileConfig(
  result: Omit<GovernanceIncidentRecoveryProfileConfigResult, "summary">,
): GovernanceIncidentRecoveryProfileConfigResult["summary"] {
  return {
    summaryId: `incident-profile-config-summary-${Date.now()}`,
    text: [
      `source=${result.source.type}`,
      `externalHit=${result.resolved.resolvedFrom === "external"}`,
      `fallback=${result.trace.fallbackUsed}`,
      `mergeStrategy=${result.source.mergeStrategy}`,
      `profileVersion=${result.snapshot.profileVersion}`,
      `selectedProfile=${result.resolved.selectedProfileId}`,
      `status=${result.status}`,
    ].join(" "),
    traceId: result.trace.traceId,
  };
}
