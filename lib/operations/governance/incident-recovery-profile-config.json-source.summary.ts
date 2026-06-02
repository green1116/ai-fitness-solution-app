import type { GovernanceIncidentRecoveryProfileJsonSourceResult } from "./incident-recovery-profile-config.json-source.types";

export function summarizeIncidentRecoveryProfileJsonSource(
  result: Omit<GovernanceIncidentRecoveryProfileJsonSourceResult, "summary">,
): GovernanceIncidentRecoveryProfileJsonSourceResult["summary"] {
  return {
    summaryId: `incident-profile-json-summary-${Date.now()}`,
    text: [
      `loaded=${result.loaded.loaded}`,
      `validated=${result.validated.valid}`,
      `override=${result.merged.overrideHit}`,
      `fallback=${result.resolved.fallbackToBuiltin}`,
      `path=${result.path}`,
      `version=${result.snapshot.schemaVersion}`,
      `status=${result.status}`,
    ].join(" "),
    traceId: result.trace.traceId,
  };
}
