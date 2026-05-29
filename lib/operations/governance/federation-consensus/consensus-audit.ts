import type {
  ConsensusAuditRecord,
  ConsensusQuorumResult,
  ConsensusReconciliationResult,
  ConsensusResolution,
} from "./consensus-types";

export function buildConsensusAuditRecords(input: {
  federationId: string;
  quorum: ConsensusQuorumResult;
  resolution: ConsensusResolution;
  reconciliation: ConsensusReconciliationResult;
}): ConsensusAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      proposalId: input.quorum.proposalId,
      federationId: input.federationId,
      participatingNodes: input.quorum.participatingNodes,
      decision: input.resolution.decision,
      quorumReached: input.quorum.quorumReached,
      reconciliationApplied: input.reconciliation.convergenceScore >= 0.5,
      timestamp: now,
    },
  ];
}
