import type { PolicyConflictArbitration, PolicyRollbackPropagation } from "./propagation-types";
import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";

export function propagatePolicyRollback(input: {
  deploymentId: string;
  consensus: ConsensusRuntimeResult;
  conflict: PolicyConflictArbitration;
  syncedDomains: string[];
}): PolicyRollbackPropagation {
  const needsRollback =
    input.consensus.resolution.decision === "rejected" ||
    (input.conflict.conflicts.length > 2 && input.conflict.resolution === "target_wins");

  const rollbackVersion = needsRollback
    ? `rollback-${input.consensus.proposal.proposalId}`
    : input.consensus.proposal.payload;

  return {
    rollbackId: `policy-rollback-${input.deploymentId}`,
    rollbackVersion,
    affectedDomains: needsRollback ? input.syncedDomains : [],
    rollbackApplied: needsRollback,
  };
}
