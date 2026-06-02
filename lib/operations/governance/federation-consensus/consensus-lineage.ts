import type {
  ConsensusLineageGraph,
  ConsensusQuorumResult,
  ConsensusReconciliationResult,
  ConsensusRecoveryCoordination,
  ConsensusResolution,
  ConsensusStateConvergence,
  ConsensusVote,
} from "./consensus-types";

export function buildConsensusLineageGraph(input: {
  deploymentId: string;
  votes: ConsensusVote[];
  quorum: ConsensusQuorumResult;
  reconciliation: ConsensusReconciliationResult;
  convergence: ConsensusStateConvergence;
  recovery: ConsensusRecoveryCoordination;
}): ConsensusLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `consensus-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-voting-${input.deploymentId}`,
        event: "voting",
        detail: `votes=${input.votes.length} approved=${input.votes.filter((v) => v.vote === "approve").length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-quorum-${input.quorum.proposalId}`,
        event: "quorum",
        detail: `reached=${input.quorum.quorumReached} rate=${input.quorum.approvalRate.toFixed(2)} decision=${input.quorum.consensusDecision}`,
        timestamp: now,
      },
      {
        entryId: `lineage-reconciliation-${input.reconciliation.reconciliationId}`,
        event: "reconciliation",
        detail: `score=${input.reconciliation.convergenceScore.toFixed(2)} policy=${input.reconciliation.policyReconciled}`,
        timestamp: now,
      },
      {
        entryId: `lineage-convergence-${input.convergence.convergenceId}`,
        event: "convergence",
        detail: `prior=${input.convergence.priorState} target=${input.convergence.targetState} converged=${input.convergence.converged}`,
        timestamp: now,
      },
      {
        entryId: `lineage-recovery-${input.recovery.recoveryId}`,
        event: "recovery",
        detail: `action=${input.recovery.stabilizationAction} fallback=${input.recovery.fallbackConsensus}`,
        timestamp: now,
      },
    ],
  };
}
