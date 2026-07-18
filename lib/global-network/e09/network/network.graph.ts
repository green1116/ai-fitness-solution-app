/**
 * E09-P1 — Network Graph Engine
 * Mutable in-memory graph over GlobalNetworkNode + NetworkEdge
 */

import { GLOBAL_EDGE_RELATIONS } from "../core/global.constants";
import type {
  GlobalEdgeRelation,
  NetworkEdge,
} from "../core/global.types";
import {
  cloneGlobalNetworkNode,
  type GlobalNetworkNode,
  wrapGlobalNetworkNode,
} from "./network.node";
import type { GlobalNode } from "../core/global.types";

export type ConnectInput = {
  source: string;
  target: string;
  relation: GlobalEdgeRelation;
  weight?: number;
};

export type NetworkGraph = {
  addNode: (node: GlobalNetworkNode | GlobalNode) => GlobalNetworkNode;
  removeNode: (id: string) => boolean;
  connect: (input: ConnectInput) => NetworkEdge;
  disconnect: (
    source: string,
    target: string,
    relation?: GlobalEdgeRelation,
  ) => number;
  getNode: (id: string) => GlobalNetworkNode | undefined;
  getEdges: (filter?: {
    source?: string;
    target?: string;
    relation?: GlobalEdgeRelation;
  }) => NetworkEdge[];
  findNeighbors: (
    id: string,
    options?: { directed?: boolean; relation?: GlobalEdgeRelation },
  ) => GlobalNetworkNode[];
  listNodes: () => GlobalNetworkNode[];
  nodeCount: () => number;
  edgeCount: () => number;
  clear: () => void;
};

function edgeKey(
  source: string,
  target: string,
  relation: GlobalEdgeRelation,
): string {
  return `${source}->${target}:${relation}`;
}

function assertRelation(
  relation: string,
): asserts relation is GlobalEdgeRelation {
  if (!(GLOBAL_EDGE_RELATIONS as readonly string[]).includes(relation)) {
    throw new Error(`invalid edge relation: ${relation}`);
  }
}

export function createNetworkGraph(): NetworkGraph {
  const nodes = new Map<string, GlobalNetworkNode>();
  const edges = new Map<string, NetworkEdge>();

  function addNode(node: GlobalNetworkNode | GlobalNode): GlobalNetworkNode {
    const wrapped =
      "layer" in node && node.layer === "e09-network"
        ? cloneGlobalNetworkNode(node as GlobalNetworkNode)
        : wrapGlobalNetworkNode(node);

    if (nodes.has(wrapped.id)) {
      throw new Error(`node already in graph: ${wrapped.id}`);
    }
    nodes.set(wrapped.id, wrapped);
    return cloneGlobalNetworkNode(wrapped);
  }

  function removeNode(id: string): boolean {
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

  function connect(input: ConnectInput): NetworkEdge {
    const source = input.source.trim();
    const target = input.target.trim();
    assertRelation(input.relation);

    if (!nodes.has(source)) {
      throw new Error(`connect source missing: ${source}`);
    }
    if (!nodes.has(target)) {
      throw new Error(`connect target missing: ${target}`);
    }
    if (source === target) {
      throw new Error("connect refuses self-loop");
    }

    const weight = input.weight ?? 1;
    if (!Number.isFinite(weight)) {
      throw new Error("edge.weight must be a finite number");
    }

    const key = edgeKey(source, target, input.relation);
    if (edges.has(key)) {
      throw new Error(`edge already exists: ${key}`);
    }

    const edge: NetworkEdge = {
      source,
      target,
      relation: input.relation,
      weight,
    };
    edges.set(key, edge);
    return { ...edge };
  }

  function disconnect(
    source: string,
    target: string,
    relation?: GlobalEdgeRelation,
  ): number {
    const src = source.trim();
    const tgt = target.trim();
    let removed = 0;

    if (relation) {
      assertRelation(relation);
      const key = edgeKey(src, tgt, relation);
      if (edges.delete(key)) removed += 1;
      return removed;
    }

    for (const [ek, edge] of edges) {
      if (edge.source === src && edge.target === tgt) {
        edges.delete(ek);
        removed += 1;
      }
    }
    return removed;
  }

  function getNode(id: string): GlobalNetworkNode | undefined {
    const node = nodes.get(id.trim());
    return node ? cloneGlobalNetworkNode(node) : undefined;
  }

  function getEdges(filter?: {
    source?: string;
    target?: string;
    relation?: GlobalEdgeRelation;
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

  function findNeighbors(
    id: string,
    options?: { directed?: boolean; relation?: GlobalEdgeRelation },
  ): GlobalNetworkNode[] {
    const key = id.trim();
    if (!nodes.has(key)) {
      throw new Error(`node not found: ${id}`);
    }

    const directed = options?.directed ?? true;
    const neighborIds = new Set<string>();

    for (const edge of edges.values()) {
      if (options?.relation && edge.relation !== options.relation) continue;

      if (edge.source === key) {
        neighborIds.add(edge.target);
      } else if (!directed && edge.target === key) {
        neighborIds.add(edge.source);
      }
    }

    return [...neighborIds]
      .map((nid) => nodes.get(nid))
      .filter((n): n is GlobalNetworkNode => Boolean(n))
      .map((n) => cloneGlobalNetworkNode(n));
  }

  return {
    addNode,
    removeNode,
    connect,
    disconnect,
    getNode,
    getEdges,
    findNeighbors,
    listNodes: () =>
      [...nodes.values()].map((n) => cloneGlobalNetworkNode(n)),
    nodeCount: () => nodes.size,
    edgeCount: () => edges.size,
    clear: () => {
      nodes.clear();
      edges.clear();
    },
  };
}
