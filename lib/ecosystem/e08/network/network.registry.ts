/**
 * E08-P2 — Multi Organization Network Registry
 * Networks bind organization nodes onto E08 ecosystem partners
 */

import { getPartnerById } from "../core/ecosystem.registry";
import { getRelationshipById } from "../relationship/relationship.registry";
import {
  E08_NETWORK_BASE,
  E08_NETWORK_FREEZE_VERSION,
  E08_NETWORK_RUNTIME_ID,
  E08_NETWORK_VERSION,
  NETWORK_KINDS,
} from "./network.constants";
import type {
  NetworkDefinition,
  NetworkKind,
  NetworkRegistryManifest,
  OrganizationNodeDefinition,
} from "./network.types";

export const NETWORK_CATALOG: NetworkDefinition[] = [
  {
    id: "e08.network.supply-chain",
    name: "Supply Chain Network",
    kind: "supply-chain",
    description: "Supplier feeds customer delivery across the ecosystem",
    nodes: [
      {
        id: "e08.org.supply.supplier",
        name: "Supplier Org",
        description: "Inbound supply organization",
        partnerId: "e08.partner.supplier",
        relationshipId: "e08.rel.supply",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "e08.org.supply.customer",
        name: "Customer Org",
        description: "Customer served from supply",
        partnerId: "e08.partner.customer",
        relationshipId: "e08.rel.serve",
        dependsOn: ["e08.org.supply.supplier"],
        optional: false,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.network.go-to-market",
    name: "Go-To-Market Network",
    kind: "go-to-market",
    description: "Supplier, channel, and alliance partner distribution mesh",
    nodes: [
      {
        id: "e08.org.gtm.supplier",
        name: "Supplier Org",
        description: "Source supply for channel distribution",
        partnerId: "e08.partner.supplier",
        relationshipId: "e08.rel.supply",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "e08.org.gtm.channel",
        name: "Channel Org",
        description: "Channel distributor",
        partnerId: "e08.partner.channel",
        relationshipId: "e08.rel.distribute",
        dependsOn: ["e08.org.gtm.supplier"],
        optional: false,
        readOnly: true,
      },
      {
        id: "e08.org.gtm.alliance",
        name: "Alliance Org",
        description: "Strategic alliance partner",
        partnerId: "e08.partner.alliance",
        relationshipId: "e08.rel.alliance",
        dependsOn: ["e08.org.gtm.channel"],
        optional: false,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.network.compliance",
    name: "Compliance Hub Network",
    kind: "compliance",
    description: "Channel and customer converge into regulator then hub",
    nodes: [
      {
        id: "e08.org.comp.channel",
        name: "Channel Org",
        description: "Channel subject to compliance",
        partnerId: "e08.partner.channel",
        relationshipId: "e08.rel.distribute",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "e08.org.comp.customer",
        name: "Customer Org",
        description: "Customer subject to compliance",
        partnerId: "e08.partner.customer",
        relationshipId: "e08.rel.serve",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "e08.org.comp.regulator",
        name: "Regulator Org",
        description: "Regulatory compliance organization",
        partnerId: "e08.partner.regulator",
        relationshipId: "e08.rel.comply",
        dependsOn: ["e08.org.comp.channel", "e08.org.comp.customer"],
        optional: false,
        readOnly: true,
      },
      {
        id: "e08.org.comp.hub",
        name: "Hub Org",
        description: "Ecosystem coordination hub",
        partnerId: "e08.partner.hub",
        relationshipId: "e08.rel.coordinate",
        dependsOn: ["e08.org.comp.regulator"],
        optional: false,
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
];

function assertOrganizationNode(
  networkId: string,
  node: OrganizationNodeDefinition,
  nodeIds: Set<string>,
): void {
  if (!node.id.trim()) throw new Error("node.id is required");
  if (!node.name.trim()) throw new Error("node.name is required");
  if (node.readOnly !== true) throw new Error("readOnly must be true");

  const partner = getPartnerById(node.partnerId);
  if (!partner) {
    throw new Error(`missing E08 partner: ${node.partnerId}`);
  }
  if (!getRelationshipById(node.relationshipId)) {
    throw new Error(
      `unknown relationship ${node.relationshipId} on ${networkId}/${node.id}`,
    );
  }
  if (!partner.relationshipIds.includes(node.relationshipId)) {
    throw new Error(
      `relationship ${node.relationshipId} not owned by ${partner.id} (${networkId}/${node.id})`,
    );
  }

  for (const dep of node.dependsOn) {
    if (!nodeIds.has(dep)) {
      throw new Error(
        `unknown dependency ${dep} on ${networkId}/${node.id}`,
      );
    }
  }
}

export function assertNetworkDefinition(network: NetworkDefinition): void {
  if (!network.id.trim()) throw new Error("network.id is required");
  if (!network.name.trim()) throw new Error("network.name is required");
  if (!(NETWORK_KINDS as readonly string[]).includes(network.kind)) {
    throw new Error(`invalid network kind: ${network.kind}`);
  }
  if (network.readOnly !== true) throw new Error("readOnly must be true");
  if (network.nodes.length === 0) {
    throw new Error(`network ${network.id} requires organization nodes`);
  }

  const nodeIds = new Set(network.nodes.map((n) => n.id));
  if (nodeIds.size !== network.nodes.length) {
    throw new Error(`duplicate organization nodes in ${network.id}`);
  }

  for (const node of network.nodes) {
    assertOrganizationNode(network.id, node, nodeIds);
  }
}

export function getNetworkById(id: string): NetworkDefinition | undefined {
  return NETWORK_CATALOG.find((n) => n.id === id);
}

export function getNetworkByKind(
  kind: NetworkKind,
): NetworkDefinition | undefined {
  return NETWORK_CATALOG.find((n) => n.kind === kind);
}

export function listNetworksForPartner(
  partnerId: string,
): NetworkDefinition[] {
  return NETWORK_CATALOG.filter((n) =>
    n.nodes.some((node) => node.partnerId === partnerId),
  );
}

export function buildNetworkRegistryManifest(
  networks: NetworkDefinition[] = NETWORK_CATALOG,
): NetworkRegistryManifest {
  for (const network of networks) {
    assertNetworkDefinition(network);
  }

  const kinds = [...new Set(networks.map((n) => n.kind))];
  const catalogComplete = NETWORK_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Network catalog incomplete: missing kinds");
  }

  return {
    runtimeId: E08_NETWORK_RUNTIME_ID,
    version: E08_NETWORK_VERSION,
    freezeVersion: E08_NETWORK_FREEZE_VERSION,
    base: E08_NETWORK_BASE,
    networkCount: networks.length,
    kinds,
    networks,
    catalogComplete: true,
    readOnly: true,
  };
}
