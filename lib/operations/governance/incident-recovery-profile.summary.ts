import type { GovernanceIncidentRecoveryProfileResult } from "./incident-recovery-profile.types";

export function summarizeIncidentRecoveryProfile(
  result: Omit<GovernanceIncidentRecoveryProfileResult, "summary">,
): GovernanceIncidentRecoveryProfileResult["summary"] {
  return {
    summaryId: `incident-profile-summary-${Date.now()}`,
    text: [
      `profile=${result.snapshot.profileName}`,
      `strategy=${result.decision.strategy}`,
      `manual=${result.decision.requiresManualIntervention}`,
      `degraded=${result.decision.degradedMode}`,
      `partial=${result.decision.partialRecovery}`,
      `status=${result.status}`,
      `matched=${result.matches.filter((m) => m.matched).length}`,
    ].join(" "),
    traceId: result.trace.traceId,
  };
}
