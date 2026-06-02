import type { FederationDomain, FederationPolicyPropagation } from "./federation-types";

export function propagateFederationPolicies(input: {
  deploymentId: string;
  sourceDomain: FederationDomain;
  targetDomains: FederationDomain[];
  policyPackMode: string;
}): FederationPolicyPropagation {
  const propagatedPolicies = [input.policyPackMode, ...input.sourceDomain.supportedPolicies];
  const accepted: string[] = [];
  const rejected: string[] = [];
  for (const domain of input.targetDomains) {
    if (domain.supportedPolicies.includes(input.policyPackMode)) {
      accepted.push(domain.domainId);
    } else {
      rejected.push(domain.domainId);
    }
  }
  return {
    propagationId: `fed-policy-${input.deploymentId}`,
    sourceDomainId: input.sourceDomain.domainId,
    targetDomainIds: input.targetDomains.map((d) => d.domainId),
    propagatedPolicies: [...new Set(propagatedPolicies)],
    accepted,
    rejected,
  };
}
