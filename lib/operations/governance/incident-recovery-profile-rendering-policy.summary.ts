import type { GovernanceIncidentRecoveryProfileRenderingPolicyResult } from "./incident-recovery-profile-rendering-policy.types";

export function summarizeIncidentRecoveryProfileRenderingPolicy(
  result: Omit<GovernanceIncidentRecoveryProfileRenderingPolicyResult, "summary">,
): GovernanceIncidentRecoveryProfileRenderingPolicyResult["summary"] {
  return {
    summaryId: `incident-profile-rendering-policy-summary-${Date.now()}`,
    text: `mode=${result.mode} matched=${result.matches.filter((m) => m.matched).length} trace=${result.snapshot.keepTrace} compress=${result.snapshot.compressSummary} status=${result.status}`,
    traceId: result.trace.traceId,
  };
}
