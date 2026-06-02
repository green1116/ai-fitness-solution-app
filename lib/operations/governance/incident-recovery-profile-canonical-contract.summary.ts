import type { GovernanceIncidentRecoveryProfileCanonicalContractResult } from "./incident-recovery-profile-canonical-contract.types";

export function summarizeIncidentRecoveryProfileCanonicalContract(
  result: Omit<GovernanceIncidentRecoveryProfileCanonicalContractResult, "summary">,
): GovernanceIncidentRecoveryProfileCanonicalContractResult["summary"] {
  return {
    summaryId: `incident-profile-contract-summary-${Date.now()}`,
    text: `contract=${result.snapshot.contractId} version=${result.snapshot.contractVersion} consumer=${result.consumer}@${result.consumerVersion} status=${result.status} matrix=${result.matrix.entries.length}`,
    traceId: result.trace.traceId,
  };
}
