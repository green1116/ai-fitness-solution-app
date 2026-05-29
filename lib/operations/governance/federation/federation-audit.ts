import type {
  FederationAuditRecord,
  FederationPolicyPropagation,
  FederationRecoveryCoordination,
  FederationRoutingDecision,
} from "./federation-types";

export function buildFederationAuditRecords(input: {
  federationId: string;
  routing: FederationRoutingDecision;
  policy: FederationPolicyPropagation;
  recovery: FederationRecoveryCoordination;
  capabilityDecision: string;
}): FederationAuditRecord[] {
  const timestamp = new Date().toISOString();
  return [
    {
      federationId: input.federationId,
      domainId: input.routing.sourceDomainId,
      action: "federation-routing",
      routingDecision: input.routing.status,
      governanceDecision: input.capabilityDecision,
      recoveryAction: input.recovery.stabilizationAction,
      timestamp,
    },
    {
      federationId: input.federationId,
      domainId: input.routing.targetDomainId,
      action: "policy-propagation",
      routingDecision: input.routing.routePath.join(">"),
      governanceDecision: `accepted=${input.policy.accepted.length}`,
      recoveryAction: input.recovery.sharedRecovery ? "shared-recovery" : undefined,
      timestamp,
    },
  ];
}
