import type {
  FederatedPolicyBundle,
  PolicyFreezePropagation,
  PolicyPropagationAuditRecord,
  PolicyRollbackPropagation,
  PolicySyncResult,
} from "./propagation-types";

export function buildPolicyPropagationAuditRecords(input: {
  federationId: string;
  bundle: FederatedPolicyBundle;
  sync: PolicySyncResult;
  rollback: PolicyRollbackPropagation;
  freeze: PolicyFreezePropagation;
}): PolicyPropagationAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      bundleId: input.bundle.bundleId,
      federationId: input.federationId,
      domainsAffected: [...input.sync.syncedDomains, ...input.sync.pendingDomains],
      decision: input.bundle.consensusDecision,
      syncRate: input.sync.syncRate,
      rollbackApplied: input.rollback.rollbackApplied,
      freezeApplied: input.freeze.frozenDomains.length > 0 || input.freeze.partialAvailability,
      timestamp: now,
    },
  ];
}
