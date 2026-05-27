/**
 * V3.7 FINAL —rollback governance policy (static)
 */

import { buildSnapshotRestorePlan } from "../snapshot/snapshot-restore";
import { V37_FINAL_RELEASE_GENERATION } from "../shared";

export const ROLLBACK_GOVERNANCE_VERSION = "3.7-final-rollback-governance-1" as const;

export type RollbackGovernancePolicy = {
  version: typeof ROLLBACK_GOVERNANCE_VERSION;
  policyId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  rollbackPolicyEnforced: boolean;
  rollbackReady: boolean;
  rollbackLineage: string[];
  summary: string;
};

export function buildRollbackGovernancePolicy(input?: { deploymentId?: string }): RollbackGovernancePolicy {
  const deploymentId = input?.deploymentId ?? "rollback-governance";
  const policyId = `RBP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const restore = buildSnapshotRestorePlan({ deploymentId });

  return {
    version: ROLLBACK_GOVERNANCE_VERSION,
    policyId,
    generation: V37_FINAL_RELEASE_GENERATION,
    rollbackPolicyEnforced: true,
    rollbackReady: restore.restoreReady,
    rollbackLineage: restore.rollbackLineage,
    summary: `rollback-governance id=${policyId} ready=${restore.restoreReady} lineage=${restore.rollbackLineage.length}`,
  };
}
