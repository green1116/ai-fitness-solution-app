/**
 * E08-P7 — Enterprise Network OS Registry
 * Network OS definitions bind ordered market agents into operating planes
 */

import { getMarketAgentById } from "../market/market.registry";
import {
  E08_NETWORK_OS_BASE,
  E08_NETWORK_OS_FREEZE_VERSION,
  E08_NETWORK_OS_ID,
  E08_NETWORK_OS_VERSION,
  NETWORK_OS_KINDS,
} from "./networkos.constants";
import type {
  NetworkOsDefinition,
  NetworkOsKind,
  NetworkOsRegistryManifest,
} from "./networkos.types";

export const NETWORK_OS_CATALOG: NetworkOsDefinition[] = [
  {
    id: "e08.networkos.capture-sector",
    name: "Capture Sector OS",
    kind: "sector",
    mission: "Operate supply-side market capture as a network sector",
    description: "Sector plane controlling the market capture agent",
    marketAgentIds: ["e08.market.capture"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.networkos.growth-program",
    name: "Growth Program OS",
    kind: "program",
    mission: "Coordinate capture and expansion across the network",
    description: "Program plane spanning capture and expand market agents",
    marketAgentIds: ["e08.market.capture", "e08.market.expand"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.networkos.enterprise",
    name: "Enterprise Network OS",
    kind: "enterprise",
    mission: "Operate the full autonomous market agent network",
    description:
      "Enterprise plane covering capture, expand, and stabilize market agents",
    marketAgentIds: [
      "e08.market.capture",
      "e08.market.expand",
      "e08.market.stabilize",
    ],
    optional: false,
    readOnly: true,
  },
];

export function assertNetworkOsDefinition(
  definition: NetworkOsDefinition,
): void {
  if (!definition.id.trim()) throw new Error("definition.id is required");
  if (!definition.name.trim()) throw new Error("definition.name is required");
  if (!definition.mission.trim()) {
    throw new Error("definition.mission is required");
  }
  if (!(NETWORK_OS_KINDS as readonly string[]).includes(definition.kind)) {
    throw new Error(`invalid network os kind: ${definition.kind}`);
  }
  if (definition.readOnly !== true) throw new Error("readOnly must be true");
  if (definition.marketAgentIds.length === 0) {
    throw new Error(`definition ${definition.id} requires market agents`);
  }

  for (const marketAgentId of definition.marketAgentIds) {
    if (!getMarketAgentById(marketAgentId)) {
      throw new Error(
        `unknown market agent ${marketAgentId} on ${definition.id}`,
      );
    }
  }
}

export function getNetworkOsById(
  id: string,
): NetworkOsDefinition | undefined {
  return NETWORK_OS_CATALOG.find((d) => d.id === id);
}

export function getNetworkOsByKind(
  kind: NetworkOsKind,
): NetworkOsDefinition | undefined {
  return NETWORK_OS_CATALOG.find((d) => d.kind === kind);
}

export function listNetworkOsForMarketAgent(
  marketAgentId: string,
): NetworkOsDefinition[] {
  return NETWORK_OS_CATALOG.filter((d) =>
    d.marketAgentIds.includes(marketAgentId),
  );
}

export function buildNetworkOsRegistryManifest(
  definitions: NetworkOsDefinition[] = NETWORK_OS_CATALOG,
): NetworkOsRegistryManifest {
  for (const definition of definitions) {
    assertNetworkOsDefinition(definition);
  }

  const kinds = [...new Set(definitions.map((d) => d.kind))];
  const catalogComplete = NETWORK_OS_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Network OS catalog incomplete: missing kinds");
  }

  return {
    networkOsId: E08_NETWORK_OS_ID,
    version: E08_NETWORK_OS_VERSION,
    freezeVersion: E08_NETWORK_OS_FREEZE_VERSION,
    base: E08_NETWORK_OS_BASE,
    definitionCount: definitions.length,
    kinds,
    definitions,
    catalogComplete: true,
    readOnly: true,
  };
}
