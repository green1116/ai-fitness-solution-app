import type { PolicyDisseminationResult, PolicySyncResult } from "./propagation-types";
import type { FederationDomain } from "../federation/federation-types";

export function syncFederatedPolicies(input: {
  deploymentId: string;
  dissemination: PolicyDisseminationResult;
  domains: FederationDomain[];
  federationPolicyAccepted: string[];
}): PolicySyncResult {
  const syncedDomains: string[] = [];
  const pendingDomains: string[] = [];

  for (const domainId of input.dissemination.targetDomains) {
    const domain = input.domains.find((d) => d.domainId === domainId);
    if (!domain) {
      pendingDomains.push(domainId);
      continue;
    }
    const accepted =
      input.federationPolicyAccepted.includes(domainId) ||
      input.dissemination.disseminatedPolicies.some((p) => domain.supportedPolicies.includes(p));
    if (accepted && domain.trustLevel !== "restricted") {
      syncedDomains.push(domainId);
    } else if (accepted) {
      syncedDomains.push(domainId);
    } else {
      pendingDomains.push(domainId);
    }
  }

  const total = input.dissemination.targetDomains.length;
  const syncRate = total > 0 ? syncedDomains.length / total : 1;

  return {
    syncId: `policy-sync-${input.deploymentId}`,
    syncedDomains,
    pendingDomains,
    syncRate,
  };
}
