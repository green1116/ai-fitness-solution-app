import type { PolicyBoundaryEnforcement } from "./propagation-types";
import type { FederationDomain } from "../federation/federation-types";

export function enforcePolicyBoundaries(input: {
  deploymentId: string;
  bundle: { policies: string[]; sourceDomainId: string };
  domains: FederationDomain[];
  syncedDomains: string[];
}): PolicyBoundaryEnforcement {
  const boundaryViolations: string[] = [];
  const isolatedDomains: string[] = [];

  for (const domain of input.domains) {
    if (domain.governanceLevel === "isolated" && input.syncedDomains.includes(domain.domainId)) {
      const violation = input.bundle.policies.some(
        (p) => !domain.supportedPolicies.includes(p) && p !== "standard",
      );
      if (violation) {
        boundaryViolations.push(domain.domainId);
        isolatedDomains.push(domain.domainId);
      }
    }
    if (domain.trustLevel === "restricted" && domain.domainId !== input.bundle.sourceDomainId) {
      const strictPolicy = input.bundle.policies.includes("strict");
      if (strictPolicy && !domain.supportedPolicies.includes("strict")) {
        boundaryViolations.push(`${domain.domainId}:strict-boundary`);
      }
    }
  }

  return {
    enforcementId: `policy-boundary-${input.deploymentId}`,
    boundaryViolations,
    enforced: boundaryViolations.length === 0,
    isolatedDomains,
  };
}
