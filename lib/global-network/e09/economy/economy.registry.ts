/**
 * E09-P5 — Economic Node Registry
 * Registers economic nodes, optionally bound to market / region / global node
 */

import { getMarket } from "../market/market.registry";
import { getRegion } from "../regional/regional.registry";
import {
  E09_ECONOMY_BASE,
  E09_ECONOMY_FREEZE_VERSION,
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
  ECONOMIC_NODE_STATUSES,
  ECONOMIC_NODE_TYPES,
} from "./economy.constants";
import type {
  EconomicNode,
  EconomicNodeStatus,
  EconomicNodeType,
  EconomyRegistryManifest,
  RegisterEconomicNodeInput,
} from "./economy.types";

const nodes = new Map<string, EconomicNode>();

function cloneNode(node: EconomicNode): EconomicNode {
  return {
    ...node,
    metadata: { ...node.metadata },
  };
}

function assertNodeType(type: string): asserts type is EconomicNodeType {
  if (!(ECONOMIC_NODE_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid economic node type: ${type}`);
  }
}

function assertNodeStatus(
  status: string,
): asserts status is EconomicNodeStatus {
  if (!(ECONOMIC_NODE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid economic node status: ${status}`);
  }
}

function assertBalance(balance: number): void {
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error("balance must be a finite number >= 0");
  }
}

export function registerEconomicNode(
  input: RegisterEconomicNodeInput,
): EconomicNode {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("economic node.id is required");
  if (!name) throw new Error("economic node.name is required");
  assertNodeType(input.type);

  const status = input.status ?? "ACTIVE";
  assertNodeStatus(status);

  const balance = input.balance ?? 0;
  assertBalance(balance);

  if (nodes.has(id)) {
    throw new Error(`economic node already registered: ${id}`);
  }

  const marketId = input.marketId?.trim();
  if (marketId && !getMarket(marketId)) {
    throw new Error(`market not found: ${marketId}`);
  }

  const regionId = input.regionId?.trim();
  if (regionId && !getRegion(regionId)) {
    throw new Error(`region not found: ${regionId}`);
  }

  const globalNodeId = input.globalNodeId?.trim();

  const node: EconomicNode = {
    id,
    name,
    type: input.type,
    status,
    balance,
    marketId: marketId || undefined,
    regionId: regionId || undefined,
    globalNodeId: globalNodeId || undefined,
    metadata: { ...(input.metadata ?? {}) },
  };

  nodes.set(id, node);
  return cloneNode(node);
}

export function getEconomicNode(id: string): EconomicNode | undefined {
  const node = nodes.get(id.trim());
  return node ? cloneNode(node) : undefined;
}

export function listEconomicNodes(filter?: {
  status?: EconomicNodeStatus;
  type?: EconomicNodeType;
  marketId?: string;
  regionId?: string;
}): EconomicNode[] {
  let result = [...nodes.values()];
  if (filter?.status) {
    result = result.filter((n) => n.status === filter.status);
  }
  if (filter?.type) {
    result = result.filter((n) => n.type === filter.type);
  }
  if (filter?.marketId) {
    const marketId = filter.marketId.trim();
    result = result.filter((n) => n.marketId === marketId);
  }
  if (filter?.regionId) {
    const regionId = filter.regionId.trim();
    result = result.filter((n) => n.regionId === regionId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneNode);
}

export function removeEconomicNode(id: string): boolean {
  return nodes.delete(id.trim());
}

/** Persist balance mutation (used by flow settlement). */
export function setEconomicNodeBalance(
  id: string,
  balance: number,
): EconomicNode {
  const node = nodes.get(id.trim());
  if (!node) throw new Error(`economic node not found: ${id}`);
  assertBalance(balance);
  node.balance = balance;
  nodes.set(node.id, node);
  return cloneNode(node);
}

export function buildEconomyRegistryManifest(): EconomyRegistryManifest {
  const list = listEconomicNodes();
  return {
    economyId: E09_ECONOMY_ID,
    version: E09_ECONOMY_VERSION,
    freezeVersion: E09_ECONOMY_FREEZE_VERSION,
    base: E09_ECONOMY_BASE,
    nodeCount: list.length,
    nodes: list,
  };
}

export function clearEconomicNodes(): void {
  nodes.clear();
}
