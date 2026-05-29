import type {
  FederatedPolicyBundle,
  PolicyDisseminationResult,
  PolicyDisseminationStatus,
} from "./propagation-types";
import type { FederationDomain } from "../federation/federation-types";

export function disseminateFederatedPolicies(input: {
  deploymentId: string;
  bundle: FederatedPolicyBundle;
  domains: FederationDomain[];
}): PolicyDisseminationResult {
  const targetDomains = input.domains
    .filter((d) => d.domainId !== input.bundle.sourceDomainId)
    .map((d) => d.domainId);

  const disseminatedPolicies: string[] = [];
  let blockedCount = 0;

  for (const domain of input.domains) {
    if (domain.domainId === input.bundle.sourceDomainId) continue;
    const compatible = input.bundle.policies.some((p) => domain.supportedPolicies.includes(p));
    if (compatible || domain.governanceLevel !== "isolated") {
      disseminatedPolicies.push(...input.bundle.policies.filter((p) => domain.supportedPolicies.includes(p) || p === input.bundle.policies[0]));
    } else {
      blockedCount += 1;
    }
  }

  let status: PolicyDisseminationStatus = "complete";
  if (blockedCount > 0 && disseminatedPolicies.length > 0) status = "partial";
  else if (blockedCount > 0 && disseminatedPolicies.length === 0) status = "blocked";

  return {
    disseminationId: `policy-dissemination-${input.deploymentId}`,
    targetDomains,
    disseminatedPolicies: [...new Set(disseminatedPolicies)],
    status,
  };
}
