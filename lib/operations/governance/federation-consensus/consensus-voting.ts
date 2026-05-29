import type {
  ConsensusProposal,
  ConsensusVote,
  FederationConsensusNode,
} from "./consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

function shouldApproveVote(
  node: FederationConsensusNode,
  federation: FederationRuntimeResult,
): boolean {
  if (node.healthStatus === "isolated") return false;
  if (node.trustLevel === "restricted") return federation.policy.accepted.length > 0;
  if (federation.routing.status === "failed" || federation.routing.status === "isolated") {
    return node.nodeRole === "leader" || node.nodeRole === "recovery";
  }
  if (federation.status === "degraded" || federation.status === "recovering") {
    return node.nodeRole !== "observer" || node.healthStatus === "healthy";
  }
  return node.healthStatus === "healthy" || node.healthStatus === "degraded";
}

export function runConsensusVoting(input: {
  proposal: ConsensusProposal;
  nodes: FederationConsensusNode[];
  federation: FederationRuntimeResult;
}): ConsensusVote[] {
  const now = new Date().toISOString();
  return input.nodes
    .filter((node) => node.votingPower > 0)
    .map((node) => {
      const approve = shouldApproveVote(node, input.federation);
      const vote: ConsensusVote["vote"] =
        node.healthStatus === "degraded" && !approve ? "abstain" : approve ? "approve" : "reject";
      const validated =
        node.supportedConsensusVersions.includes("consensus-v1") &&
        node.healthStatus !== "isolated";
      return {
        nodeId: node.nodeId,
        proposalId: input.proposal.proposalId,
        vote,
        weight: node.votingPower,
        validated,
        timestamp: now,
      };
    });
}
