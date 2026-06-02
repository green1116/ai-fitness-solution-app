import type {
  FederationDomain,
  FederationRecoveryCoordination,
  FederationRoutingDecision,
} from "./federation-types";

export function coordinateFederationRecovery(input: {
  deploymentId: string;
  routing: FederationRoutingDecision;
  domains: FederationDomain[];
  orchestrationFailed: boolean;
}): FederationRecoveryCoordination {
  const affected = input.domains
    .filter(
      (d) =>
        d.domainId === input.routing.targetDomainId ||
        d.recoveryMode === "federated" ||
        d.recoveryMode === "shared",
    )
    .map((d) => d.domainId);

  const rerouteApplied =
    input.routing.status === "degraded" || input.routing.status === "failed";
  const sharedRecovery = affected.some((id) => {
    const domain = input.domains.find((d) => d.domainId === id);
    return domain?.recoveryMode === "shared" || domain?.recoveryMode === "federated";
  });

  let stabilizationAction = "governance-stable";
  if (input.orchestrationFailed || input.routing.status === "failed") {
    stabilizationAction = "federation-failover";
  } else if (rerouteApplied) {
    stabilizationAction = "federation-reroute";
  } else if (sharedRecovery) {
    stabilizationAction = "shared-recovery-coordination";
  }

  return {
    coordinationId: `fed-recovery-${input.deploymentId}`,
    trigger: input.orchestrationFailed ? "node-failure" : "routing-degradation",
    affectedDomains: affected,
    rerouteApplied,
    sharedRecovery,
    stabilizationAction,
  };
}
