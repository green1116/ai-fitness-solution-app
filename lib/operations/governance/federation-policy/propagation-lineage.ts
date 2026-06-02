import type {
  PolicyBoundaryEnforcement,
  PolicyConflictArbitration,
  PolicyDisseminationResult,
  PolicyFanoutResult,
  PolicyFreezePropagation,
  PolicyPropagationLineageGraph,
  PolicyRollbackPropagation,
  PolicySyncResult,
  PolicyVersionPropagation,
} from "./propagation-types";

export function buildPolicyPropagationLineageGraph(input: {
  deploymentId: string;
  dissemination: PolicyDisseminationResult;
  sync: PolicySyncResult;
  fanout: PolicyFanoutResult;
  boundary: PolicyBoundaryEnforcement;
  versionPropagation: PolicyVersionPropagation;
  conflict: PolicyConflictArbitration;
  rollback: PolicyRollbackPropagation;
  freeze: PolicyFreezePropagation;
}): PolicyPropagationLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `policy-propagation-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-dissemination-${input.dissemination.disseminationId}`,
        event: "dissemination",
        detail: `targets=${input.dissemination.targetDomains.length} status=${input.dissemination.status}`,
        timestamp: now,
      },
      {
        entryId: `lineage-sync-${input.sync.syncId}`,
        event: "sync",
        detail: `synced=${input.sync.syncedDomains.length} rate=${input.sync.syncRate.toFixed(2)}`,
        timestamp: now,
      },
      {
        entryId: `lineage-fanout-${input.fanout.fanoutId}`,
        event: "fanout",
        detail: `targets=${input.fanout.fanoutTargets.length} applied=${input.fanout.appliedCount}`,
        timestamp: now,
      },
      {
        entryId: `lineage-boundary-${input.boundary.enforcementId}`,
        event: "boundary",
        detail: `enforced=${input.boundary.enforced} violations=${input.boundary.boundaryViolations.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-version-${input.versionPropagation.propagationId}`,
        event: "version",
        detail: `${input.versionPropagation.sourceVersion}>${input.versionPropagation.targetVersion}`,
        timestamp: now,
      },
      {
        entryId: `lineage-conflict-${input.conflict.arbitrationId}`,
        event: "conflict",
        detail: `conflicts=${input.conflict.conflicts.length} resolution=${input.conflict.resolution}`,
        timestamp: now,
      },
      {
        entryId: `lineage-rollback-${input.rollback.rollbackId}`,
        event: "rollback",
        detail: `applied=${input.rollback.rollbackApplied} domains=${input.rollback.affectedDomains.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-freeze-${input.freeze.freezeId}`,
        event: "freeze",
        detail: `frozen=${input.freeze.frozenDomains.length} partial=${input.freeze.partialAvailability}`,
        timestamp: now,
      },
    ],
  };
}
