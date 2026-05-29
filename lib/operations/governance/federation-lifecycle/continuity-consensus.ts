import type { FederationConsensusLifecycleState, FederationLifecyclePhase } from "./continuity-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";

export function buildFederationConsensusLifecycle(input: {
  deploymentId: string;
  consensus: ConsensusRuntimeResult;
  globalPhase: FederationLifecyclePhase;
}): FederationConsensusLifecycleState {
  let phase = input.globalPhase;
  if (input.consensus.status === "recovering") phase = "recovering";
  else if (input.consensus.status === "failed") phase = "degraded";
  else if (input.consensus.status === "partial") phase = "degraded";

  return {
    lifecycleId: `consensus-lifecycle-${input.deploymentId}`,
    proposalId: input.consensus.proposal.proposalId,
    phase,
    decision: input.consensus.resolution.decision,
    quorumReached: input.consensus.quorum.quorumReached,
  };
}
