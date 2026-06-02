import type {
  ConsensusHookEvent,
  ConsensusQuorumResult,
  ConsensusRecoveryCoordination,
  ConsensusReconciliationResult,
  ConsensusVote,
} from "./consensus-types";

export function runConsensusGovernanceHooks(input: {
  votes: ConsensusVote[];
  quorum: ConsensusQuorumResult;
  reconciliation: ConsensusReconciliationResult;
  recovery: ConsensusRecoveryCoordination;
}): ConsensusHookEvent[] {
  const leaderVote = input.votes.find((v) => v.vote === "approve") ?? input.votes[0];
  const nodeId = leaderVote?.nodeId ?? "consensus-system";

  const events: ConsensusHookEvent[] = [
    {
      phase: "beforeConsensusVote",
      nodeId,
      payload: `participants=${input.votes.length}`,
    },
    {
      phase: "afterConsensusVote",
      nodeId,
      payload: `decision=${input.quorum.consensusDecision} quorum=${input.quorum.quorumReached}`,
    },
    {
      phase: "beforeReconciliation",
      nodeId,
      payload: `score=${input.reconciliation.convergenceScore.toFixed(2)}`,
    },
    {
      phase: "afterReconciliation",
      nodeId,
      payload: `policy=${input.reconciliation.policyReconciled} state=${input.reconciliation.stateReconciled}`,
    },
  ];

  if (input.recovery.fallbackConsensus || input.recovery.emergencyMode) {
    events.push({
      phase: "beforeConsensusRecovery",
      nodeId,
      payload: input.recovery.trigger,
    });
    events.push({
      phase: "afterConsensusRecovery",
      nodeId,
      payload: input.recovery.stabilizationAction,
    });
  }

  return events;
}
