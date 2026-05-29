import type {
  FederationContinuityHandoff,
  FederationLifecycleAuditRecord,
  FederationLifecyclePhase,
  FederationRetirementArchivalResult,
} from "./continuity-types";

export function buildFederationLifecycleAuditRecords(input: {
  continuityId: string;
  federationId: string;
  phase: FederationLifecyclePhase;
  domainsAffected: string[];
  handoff: FederationContinuityHandoff;
  retirement: FederationRetirementArchivalResult;
}): FederationLifecycleAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      continuityId: input.continuityId,
      federationId: input.federationId,
      phase: input.phase,
      domainsAffected: input.domainsAffected,
      handoffApplied: input.handoff.continuityPreserved,
      archivalApplied: input.retirement.archivalComplete,
      timestamp: now,
    },
  ];
}
