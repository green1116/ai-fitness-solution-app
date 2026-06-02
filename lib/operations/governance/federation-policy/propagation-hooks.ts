import type {
  PolicyDisseminationResult,
  PolicyFreezePropagation,
  PolicyPropagationHookEvent,
  PolicyRollbackPropagation,
  PolicySyncResult,
} from "./propagation-types";

export function runPolicyPropagationHooks(input: {
  sourceDomainId: string;
  dissemination: PolicyDisseminationResult;
  sync: PolicySyncResult;
  rollback: PolicyRollbackPropagation;
  freeze: PolicyFreezePropagation;
}): PolicyPropagationHookEvent[] {
  const events: PolicyPropagationHookEvent[] = [
    {
      phase: "beforePolicyDissemination",
      domainId: input.sourceDomainId,
      payload: `targets=${input.dissemination.targetDomains.length}`,
    },
    {
      phase: "afterPolicyDissemination",
      domainId: input.sourceDomainId,
      payload: `status=${input.dissemination.status} policies=${input.dissemination.disseminatedPolicies.length}`,
    },
    {
      phase: "beforePolicySync",
      domainId: input.sourceDomainId,
      payload: `pending=${input.sync.pendingDomains.length}`,
    },
    {
      phase: "afterPolicySync",
      domainId: input.sourceDomainId,
      payload: `synced=${input.sync.syncedDomains.length} rate=${input.sync.syncRate.toFixed(2)}`,
    },
  ];

  if (input.rollback.rollbackApplied) {
    events.push({
      phase: "beforePolicyRollback",
      domainId: input.sourceDomainId,
      payload: input.rollback.rollbackVersion,
    });
    events.push({
      phase: "afterPolicyRollback",
      domainId: input.sourceDomainId,
      payload: `affected=${input.rollback.affectedDomains.length}`,
    });
  }

  if (input.freeze.frozenDomains.length > 0 || input.freeze.partialAvailability) {
    events.push({
      phase: "beforePolicyFreeze",
      domainId: input.sourceDomainId,
      payload: input.freeze.freezeReason,
    });
    events.push({
      phase: "afterPolicyFreeze",
      domainId: input.sourceDomainId,
      payload: `frozen=${input.freeze.frozenDomains.length} partial=${input.freeze.partialAvailability}`,
    });
  }

  return events;
}
