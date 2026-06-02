import type {
  FederationDomain,
  FederationRoutingDecision,
  FederationRoutingStatus,
} from "./federation-types";

export function routeFederationRequest(input: {
  deploymentId: string;
  sourceDomain: FederationDomain;
  targetDomain: FederationDomain;
  policyPackMode: string;
  capabilityDecision: string;
}): FederationRoutingDecision {
  const policyValidated = input.targetDomain.supportedPolicies.includes(input.policyPackMode);
  const isolationApplied = input.targetDomain.governanceLevel === "isolated";
  const degradedRoute =
    !policyValidated ||
    input.capabilityDecision === "restricted" ||
    input.capabilityDecision === "deny";

  let status: FederationRoutingStatus = "routed";
  if (isolationApplied) status = "isolated";
  else if (degradedRoute) status = "degraded";
  if (input.targetDomain.trustLevel === "restricted" && !policyValidated) status = "failed";

  const routePath = [
    input.sourceDomain.domainId,
    "domain-resolution",
    "federation-routing",
    policyValidated ? "policy-validated" : "policy-fallback",
    input.targetDomain.domainId,
  ];

  return {
    routingId: `fed-route-${input.deploymentId}`,
    sourceDomainId: input.sourceDomain.domainId,
    targetDomainId: input.targetDomain.domainId,
    routePath,
    policyValidated,
    isolationApplied,
    degradedRoute,
    status,
  };
}
