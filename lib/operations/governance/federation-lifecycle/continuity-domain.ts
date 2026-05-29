import type { FederationDomainLifecycleState, FederationLifecyclePhase } from "./continuity-types";
import type { FederationDomain } from "../federation/federation-types";

function domainPhase(
  domain: FederationDomain,
  globalPhase: FederationLifecyclePhase,
): FederationLifecyclePhase {
  if (domain.governanceLevel === "isolated") return globalPhase === "active" ? "degraded" : globalPhase;
  if (domain.trustLevel === "restricted" && globalPhase === "active") return "degraded";
  return globalPhase;
}

export function buildFederationDomainLifecycle(input: {
  domains: FederationDomain[];
  globalPhase: FederationLifecyclePhase;
}): FederationDomainLifecycleState[] {
  const now = new Date().toISOString();
  return input.domains.map((domain) => {
    const phase = domainPhase(domain, input.globalPhase);
    return {
      domainId: domain.domainId,
      phase,
      activated: phase === "active" || phase === "degraded" || phase === "recovering",
      lastTransitionAt: now,
    };
  });
}
