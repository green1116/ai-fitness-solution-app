import type { ConsensusQuorumResult, ConsensusResolution } from "./consensus-types";

export function resolveConsensusDecision(input: {
  deploymentId: string;
  quorum: ConsensusQuorumResult;
}): ConsensusResolution {
  const restrictedNodes = [...input.quorum.degradedNodes, ...input.quorum.rejectedNodes];
  const converged =
    input.quorum.consensusDecision === "approved" ||
    input.quorum.consensusDecision === "approved_with_restrictions";

  let detail = `decision=${input.quorum.consensusDecision} rate=${input.quorum.approvalRate.toFixed(2)}`;
  if (input.quorum.consensusDecision === "recovery_required") {
    detail += " action=fallback-consensus";
  } else if (input.quorum.consensusDecision === "approved_with_restrictions") {
    detail += ` restricted=${restrictedNodes.length}`;
  }

  return {
    resolutionId: `consensus-resolution-${input.deploymentId}`,
    proposalId: input.quorum.proposalId,
    decision: input.quorum.consensusDecision,
    converged,
    restrictedNodes,
    detail,
  };
}
