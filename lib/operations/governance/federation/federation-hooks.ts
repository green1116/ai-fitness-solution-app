import type {
  FederationHookEvent,
  FederationPolicyPropagation,
  FederationRecoveryCoordination,
  FederationRoutingDecision,
} from "./federation-types";

export function runFederationGovernanceHooks(input: {
  routing: FederationRoutingDecision;
  policy: FederationPolicyPropagation;
  recovery: FederationRecoveryCoordination;
}): FederationHookEvent[] {
  const events: FederationHookEvent[] = [
    {
      phase: "beforeFederationRouting",
      domainId: input.routing.sourceDomainId,
      payload: `target=${input.routing.targetDomainId}`,
    },
    {
      phase: "afterFederationRouting",
      domainId: input.routing.targetDomainId,
      payload: `status=${input.routing.status}`,
    },
    {
      phase: "beforePolicyPropagation",
      domainId: input.policy.sourceDomainId,
      payload: `targets=${input.policy.targetDomainIds.length}`,
    },
    {
      phase: "afterPolicyPropagation",
      domainId: input.policy.sourceDomainId,
      payload: `accepted=${input.policy.accepted.length}`,
    },
  ];
  if (input.recovery.rerouteApplied || input.recovery.sharedRecovery) {
    events.push({
      phase: "beforeFederationRecovery",
      domainId: input.routing.sourceDomainId,
      payload: input.recovery.trigger,
    });
    events.push({
      phase: "afterFederationRecovery",
      domainId: input.routing.sourceDomainId,
      payload: input.recovery.stabilizationAction,
    });
  }
  return events;
}
