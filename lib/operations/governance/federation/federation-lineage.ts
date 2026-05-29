import type {
  FederationLineageGraph,
  FederationPolicyPropagation,
  FederationRecoveryCoordination,
  FederationRoutingDecision,
  FederationTopology,
} from "./federation-types";

export function buildFederationLineageGraph(input: {
  deploymentId: string;
  topology: FederationTopology;
  routing: FederationRoutingDecision;
  policy: FederationPolicyPropagation;
  recovery: FederationRecoveryCoordination;
}): FederationLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `federation-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-topology-${input.deploymentId}`,
        event: "topology",
        detail: `domains=${input.topology.domains.length} edges=${input.topology.edges.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-routing-${input.routing.routingId}`,
        event: "routing",
        detail: `path=${input.routing.routePath.join(">")} status=${input.routing.status}`,
        timestamp: now,
      },
      {
        entryId: `lineage-policy-${input.policy.propagationId}`,
        event: "policy",
        detail: `accepted=${input.policy.accepted.length} rejected=${input.policy.rejected.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-recovery-${input.recovery.coordinationId}`,
        event: "recovery",
        detail: `action=${input.recovery.stabilizationAction} affected=${input.recovery.affectedDomains.length}`,
        timestamp: now,
      },
    ],
  };
}
