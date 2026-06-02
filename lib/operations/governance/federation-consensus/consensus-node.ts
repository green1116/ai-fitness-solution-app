import type { FederationDomain, FederationNode } from "../federation/federation-types";
import type { FederationConsensusNode, FederationConsensusNodeRole } from "./consensus-types";
import { DEFAULT_CONSENSUS_VERSION } from "./consensus-registry";

function resolveNodeRole(domainType: FederationDomain["domainType"], index: number): FederationConsensusNodeRole {
  if (domainType === "core") return index === 0 ? "leader" : "validator";
  if (domainType === "regional") return "validator";
  if (domainType === "edge") return index === 0 ? "recovery" : "observer";
  return "observer";
}

function resolveVotingPower(role: FederationConsensusNodeRole, health: FederationConsensusNode["healthStatus"]): number {
  const base =
    role === "leader" ? 3 : role === "validator" ? 2 : role === "recovery" ? 1.5 : 1;
  if (health === "degraded") return base * 0.5;
  if (health === "isolated") return 0;
  return base;
}

function mapHealthStatus(node: FederationNode): FederationConsensusNode["healthStatus"] {
  if (node.status === "failed") return "isolated";
  if (node.status === "degraded") return "degraded";
  return "healthy";
}

function mapTrustLevel(domain: FederationDomain): FederationConsensusNode["trustLevel"] {
  return domain.trustLevel;
}

export function buildFederationConsensusNodes(
  domains: FederationDomain[],
  federationNodes: FederationNode[],
): FederationConsensusNode[] {
  const now = new Date().toISOString();
  const domainById = new Map(domains.map((d) => [d.domainId, d]));
  const roleCount = new Map<string, number>();

  return federationNodes.map((node) => {
    const domain = domainById.get(node.domainId);
    const domainType = domain?.domainType ?? "consumer";
    const idx = roleCount.get(node.domainId) ?? 0;
    roleCount.set(node.domainId, idx + 1);
    const nodeRole = resolveNodeRole(domainType, idx);
    const healthStatus = mapHealthStatus(node);
    return {
      nodeId: node.nodeId,
      domainId: node.domainId,
      nodeRole,
      votingPower: resolveVotingPower(nodeRole, healthStatus),
      healthStatus,
      supportedPolicies: node.capabilities,
      supportedConsensusVersions: [DEFAULT_CONSENSUS_VERSION],
      trustLevel: domain ? mapTrustLevel(domain) : "restricted",
      lastConsensusAt: now,
    };
  });
}
