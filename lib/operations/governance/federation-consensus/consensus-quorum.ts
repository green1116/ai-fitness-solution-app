import type {
  ConsensusDecision,
  ConsensusQuorumResult,
  ConsensusVote,
  FederationConsensusNode,
} from "./consensus-types";

export function evaluateConsensusQuorum(input: {
  proposalId: string;
  votes: ConsensusVote[];
  nodes: FederationConsensusNode[];
  requiredQuorum: number;
}): ConsensusQuorumResult {
  const participatingNodes = input.votes.map((v) => v.nodeId);
  const degradedNodes = input.nodes
    .filter((n) => n.healthStatus === "degraded")
    .map((n) => n.nodeId);
  const rejectedNodes = input.votes.filter((v) => v.vote === "reject").map((v) => v.nodeId);

  const totalWeight = input.votes.reduce((sum, v) => sum + v.weight, 0);
  const approveWeight = input.votes
    .filter((v) => v.vote === "approve")
    .reduce((sum, v) => sum + v.weight, 0);
  const approvalRate = totalWeight > 0 ? approveWeight / totalWeight : 0;
  const quorumReached = approvalRate >= input.requiredQuorum;

  let consensusDecision: ConsensusDecision = "rejected";
  if (quorumReached && rejectedNodes.length === 0) {
    consensusDecision = "approved";
  } else if (quorumReached && degradedNodes.length > 0) {
    consensusDecision = "approved_with_restrictions";
  } else if (!quorumReached && approvalRate >= input.requiredQuorum * 0.5) {
    consensusDecision = "recovery_required";
  }

  return {
    proposalId: input.proposalId,
    participatingNodes,
    quorumReached,
    approvalRate,
    rejectedNodes,
    degradedNodes,
    consensusDecision,
  };
}
