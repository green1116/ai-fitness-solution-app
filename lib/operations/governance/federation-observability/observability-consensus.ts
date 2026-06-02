import type { FederationConsensusObservability } from "./observability-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";

export function observeFederationConsensus(input: {
  deploymentId: string;
  consensus: ConsensusRuntimeResult;
}): FederationConsensusObservability {
  const votes = input.consensus.votes;
  const approveCount = votes.filter((v) => v.vote === "approve" && v.validated).length;
  const votingSuccessRate = votes.length > 0 ? approveCount / votes.length : 0;
  const quorumReachRate = input.consensus.quorum.quorumReached ? 1 : input.consensus.quorum.approvalRate;
  const reconciliationRate = input.consensus.reconciliation.convergenceScore;

  let convergenceLatencyMs = 50;
  if (!input.consensus.convergence.converged) convergenceLatencyMs = 250;
  if (input.consensus.resolution.decision === "recovery_required") convergenceLatencyMs = 500;

  const recoveryConsensusCount =
    input.consensus.recovery.fallbackConsensus || input.consensus.recovery.emergencyMode ? 1 : 0;

  return {
    observabilityId: `consensus-observability-${input.deploymentId}`,
    votingSuccessRate,
    quorumReachRate,
    reconciliationRate,
    convergenceLatencyMs,
    recoveryConsensusCount,
  };
}
