import type { FederationDomain } from "./federation-types";

export function resolveFederationDomain(input: {
  domains: FederationDomain[];
  requestedDomainId?: string;
}): FederationDomain {
  if (input.requestedDomainId) {
    const match = input.domains.find((d) => d.domainId === input.requestedDomainId);
    if (match) return match;
  }
  return input.domains.find((d) => d.domainType === "core") ?? input.domains[0];
}
