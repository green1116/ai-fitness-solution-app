/**
 * E09-P1 — Global Network Registry
 * In-memory node and edge registry for the global network kernel
 */

import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_FREEZE_VERSION,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
  GLOBAL_EDGE_RELATIONS,
  GLOBAL_NODE_STATUSES,
  GLOBAL_NODE_TYPES,
} from "./global.constants";
import type {
  GlobalNode,
  GlobalRegistryManifest,
  NetworkEdge,
} from "./global.types";

const nodes = new Map<string, GlobalNode>();
const edges = new Map<string, NetworkEdge>();

function edgeKey(edge: Pick<NetworkEdge, "source" | "target" | "relation">): string {
  return `${edge.source}->${edge.target}:${edge.relation}`;
}

function assertNodeShape(node: GlobalNode): void {
  if (!node.id.trim()) throw new Error("node.id is required");
  if (!(GLOBAL_NODE_TYPES as readonly string[]).includes(node.type)) {
    throw new Error(`invalid node type: ${node.type}`);
  }
  if (!(GLOBAL_NODE_STATUSES as readonly string[]).includes(node.status)) {
    throw new Error(`invalid node status: ${node.status}`);
  }
}

function assertEdgeShape(edge: NetworkEdge): void {
  if (!edge.source.trim()) throw new Error("edge.source is required");
  if (!edge.target.trim()) throw new Error("edge.target is required");
  if (!(GLOBAL_EDGE_RELATIONS as readonly string[]).includes(edge.relation)) {
    throw new Error(`invalid edge relation: ${edge.relation}`);
  }
  if (!Number.isFinite(edge.weight)) {
    throw new Error("edge.weight must be a finite number");
  }
}

export function registerNode(node: GlobalNode): GlobalNode {
  assertNodeShape(node);
  if (nodes.has(node.id)) {
    throw new Error(`node already registered: ${node.id}`);
  }
  const stored: GlobalNode = {
    id: node.id.trim(),
    type: node.type,
    status: node.status,
    metadata: { ...(node.metadata ?? {}) },
  };
  nodes.set(stored.id, stored);
  return { ...stored, metadata: { ...stored.metadata } };
}

export function getNode(id: string): GlobalNode | undefined {
  const node = nodes.get(id.trim());
  if (!node) return undefined;
  return { ...node, metadata: { ...node.metadata } };
}

export function listNodes(filter?: {
  type?: GlobalNode["type"];
  status?: GlobalNode["status"];
}): GlobalNode[] {
  let result = [...nodes.values()];
  if (filter?.type) {
    result = result.filter((n) => n.type === filter.type);
  }
  if (filter?.status) {
    result = result.filter((n) => n.status === filter.status);
  }
  return result.map((n) => ({ ...n, metadata: { ...n.metadata } }));
}

export function removeNode(id: string): boolean {
  const key = id.trim();
  if (!nodes.has(key)) return false;

  nodes.delete(key);
  for (const [ek, edge] of edges) {
    if (edge.source === key || edge.target === key) {
      edges.delete(ek);
    }
  }
  return true;
}

export function updateNodeStatus(
  id: string,
  status: GlobalNode["status"],
): GlobalNode {
  const node = nodes.get(id.trim());
  if (!node) throw new Error(`node not found: ${id}`);
  if (!(GLOBAL_NODE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid node status: ${status}`);
  }
  const updated: GlobalNode = { ...node, status };
  nodes.set(updated.id, updated);
  return { ...updated, metadata: { ...updated.metadata } };
}

export function registerEdge(edge: NetworkEdge): NetworkEdge {
  assertEdgeShape(edge);
  if (!nodes.has(edge.source)) {
    throw new Error(`edge source missing: ${edge.source}`);
  }
  if (!nodes.has(edge.target)) {
    throw new Error(`edge target missing: ${edge.target}`);
  }
  const stored: NetworkEdge = {
    source: edge.source.trim(),
    target: edge.target.trim(),
    relation: edge.relation,
    weight: edge.weight,
  };
  edges.set(edgeKey(stored), stored);
  return { ...stored };
}

export function listEdges(filter?: {
  source?: string;
  target?: string;
  relation?: NetworkEdge["relation"];
}): NetworkEdge[] {
  let result = [...edges.values()];
  if (filter?.source) {
    result = result.filter((e) => e.source === filter.source);
  }
  if (filter?.target) {
    result = result.filter((e) => e.target === filter.target);
  }
  if (filter?.relation) {
    result = result.filter((e) => e.relation === filter.relation);
  }
  return result.map((e) => ({ ...e }));
}

export function clearRegistry(): void {
  nodes.clear();
  edges.clear();
}

export function buildGlobalRegistryManifest(): GlobalRegistryManifest {
  const nodeList = listNodes();
  const edgeList = listEdges();
  return {
    platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
    version: E09_GLOBAL_NETWORK_VERSION,
    freezeVersion: E09_GLOBAL_NETWORK_FREEZE_VERSION,
    base: E09_GLOBAL_NETWORK_BASE,
    nodeCount: nodeList.length,
    edgeCount: edgeList.length,
    nodes: nodeList,
    edges: edgeList,
  };
}
