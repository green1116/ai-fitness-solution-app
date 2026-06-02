import type { FederationDomain } from "./federation-types";

export function buildFederationRegistry(): FederationDomain[] {
  const now = new Date().toISOString();
  return [
    {
      domainId: "domain-core",
      domainType: "core",
      activeNodes: ["node-core-1", "node-core-2"],
      supportedPolicies: ["strict", "standard", "audit"],
      governanceLevel: "full",
      federationProtocols: ["governance-v1", "recovery-v1"],
      recoveryMode: "federated",
      trustLevel: "trusted",
      lastHealthCheckAt: now,
    },
    {
      domainId: "domain-regional",
      domainType: "regional",
      activeNodes: ["node-regional-1"],
      supportedPolicies: ["standard", "compat"],
      governanceLevel: "restricted",
      federationProtocols: ["governance-v1"],
      recoveryMode: "shared",
      trustLevel: "verified",
      lastHealthCheckAt: now,
    },
    {
      domainId: "domain-edge",
      domainType: "edge",
      activeNodes: ["node-edge-1"],
      supportedPolicies: ["compat", "lenient"],
      governanceLevel: "restricted",
      federationProtocols: ["governance-v1"],
      recoveryMode: "local",
      trustLevel: "verified",
      lastHealthCheckAt: now,
    },
    {
      domainId: "domain-consumer",
      domainType: "consumer",
      activeNodes: ["node-consumer-1"],
      supportedPolicies: ["compat", "audit"],
      governanceLevel: "isolated",
      federationProtocols: ["consumer-v1"],
      recoveryMode: "local",
      trustLevel: "restricted",
      lastHealthCheckAt: now,
    },
  ];
}
