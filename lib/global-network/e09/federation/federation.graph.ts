/**
 * E09-P4 — Federation Trust Graph
 * Graph of FederatedIdentity nodes linked by trust edges
 */

import {
  getFederation,
  listFederations,
} from "./federation.registry";
import type {
  FederatedIdentity,
  FederationScope,
  FederationStatus,
} from "./federation.types";

export const TRUST_EDGE_KINDS = [
  "TRUST",
  "DELEGATE",
  "ATTEST",
] as const;

export type TrustEdgeKind = (typeof TRUST_EDGE_KINDS)[number];

export type TrustEdge = {
  source: string;
  target: string;
  kind: TrustEdgeKind;
  /** Edge weight / confidence 0–100 */
  weight: number;
};

export type TrustPath = {
  nodes: string[];
  edges: TrustEdge[];
  /** Min edge weight along the path */
  minWeight: number;
  /** Combined path trust (min of node trustLevels and edge weights) */
  pathTrust: number;
};

export type TrustGraph = {
  nodes: FederatedIdentity[];
  edges: TrustEdge[];
  nodeCount: number;
  edgeCount: number;
};

export type LinkFederationsInput = {
  sourceId: string;
  targetId: string;
  kind?: TrustEdgeKind;
  weight?: number;
};

const edges = new Map<string, TrustEdge>();

function edgeKey(source: string, target: string, kind: TrustEdgeKind): string {
  return `${source}->${target}:${kind}`;
}

function cloneFederation(entry: FederatedIdentity): FederatedIdentity {
  return { ...entry };
}

function cloneEdge(edge: TrustEdge): TrustEdge {
  return { ...edge };
}

function assertEdgeKind(kind: string): asserts kind is TrustEdgeKind {
  if (!(TRUST_EDGE_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid trust edge kind: ${kind}`);
  }
}

function assertWeight(weight: number): void {
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
    throw new Error("trust edge.weight must be a finite number between 0 and 100");
  }
}

/** Link two registered federations with a trust edge. */
export function linkFederations(input: LinkFederationsInput): TrustEdge {
  const sourceId = input.sourceId.trim();
  const targetId = input.targetId.trim();
  if (!sourceId) throw new Error("link.sourceId is required");
  if (!targetId) throw new Error("link.targetId is required");
  if (sourceId === targetId) {
    throw new Error("link refuses self-loop");
  }

  const source = getFederation(sourceId);
  const target = getFederation(targetId);
  if (!source) throw new Error(`federation not found: ${sourceId}`);
  if (!target) throw new Error(`federation not found: ${targetId}`);

  const kind = input.kind ?? "TRUST";
  assertEdgeKind(kind);
  const weight = input.weight ?? 50;
  assertWeight(weight);

  const key = edgeKey(sourceId, targetId, kind);
  if (edges.has(key)) {
    throw new Error(`trust edge already exists: ${key}`);
  }

  const edge: TrustEdge = {
    source: sourceId,
    target: targetId,
    kind,
    weight,
  };
  edges.set(key, edge);
  return cloneEdge(edge);
}

/** Build a trust graph snapshot from registry federations + current links. */
export function buildTrustGraph(filter?: {
  status?: FederationStatus;
  scope?: FederationScope;
}): TrustGraph {
  const nodes = listFederations(
    filter?.status || filter?.scope
      ? { status: filter.status, scope: filter.scope }
      : undefined,
  );
  const nodeIds = new Set(nodes.map((n) => n.id));
  const graphEdges = [...edges.values()]
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map(cloneEdge);

  return {
    nodes: nodes.map(cloneFederation),
    edges: graphEdges,
    nodeCount: nodes.length,
    edgeCount: graphEdges.length,
  };
}

/**
 * Find trust paths from source federation to target (BFS, directed).
 * Uses min of node trustLevels and edge weights as pathTrust.
 */
export function getTrustPaths(
  sourceId: string,
  targetId: string,
  options?: { maxDepth?: number; kind?: TrustEdgeKind },
): TrustPath[] {
  const source = sourceId.trim();
  const target = targetId.trim();
  if (!source) throw new Error("sourceId is required");
  if (!target) throw new Error("targetId is required");
  if (!getFederation(source)) {
    throw new Error(`federation not found: ${source}`);
  }
  if (!getFederation(target)) {
    throw new Error(`federation not found: ${target}`);
  }
  if (source === target) {
    const node = getFederation(source)!;
    return [
      {
        nodes: [source],
        edges: [],
        minWeight: 100,
        pathTrust: node.trustLevel,
      },
    ];
  }

  const maxDepth = options?.maxDepth ?? 6;
  const adjacency = new Map<string, TrustEdge[]>();
  for (const edge of edges.values()) {
    if (options?.kind && edge.kind !== options.kind) continue;
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge);
    adjacency.set(edge.source, list);
  }

  const trustOf = (id: string): number =>
    getFederation(id)?.trustLevel ?? 0;

  type Frame = {
    node: string;
    path: string[];
    pathEdges: TrustEdge[];
    minWeight: number;
  };

  const paths: TrustPath[] = [];
  const queue: Frame[] = [
    { node: source, path: [source], pathEdges: [], minWeight: 100 },
  ];

  while (queue.length > 0) {
    const frame = queue.shift()!;
    if (frame.path.length - 1 > maxDepth) continue;

    for (const edge of adjacency.get(frame.node) ?? []) {
      if (frame.path.includes(edge.target)) continue;

      const nextPath = [...frame.path, edge.target];
      const nextEdges = [...frame.pathEdges, cloneEdge(edge)];
      const minWeight = Math.min(frame.minWeight, edge.weight);

      if (edge.target === target) {
        const nodeTrusts = nextPath.map(trustOf);
        const pathTrust = Math.min(minWeight, ...nodeTrusts);
        paths.push({
          nodes: nextPath,
          edges: nextEdges,
          minWeight,
          pathTrust,
        });
        continue;
      }

      if (nextPath.length - 1 < maxDepth) {
        queue.push({
          node: edge.target,
          path: nextPath,
          pathEdges: nextEdges,
          minWeight,
        });
      }
    }
  }

  return paths.sort(
    (a, b) => b.pathTrust - a.pathTrust || a.nodes.length - b.nodes.length,
  );
}

export function getTrustEdges(filter?: {
  source?: string;
  target?: string;
  kind?: TrustEdgeKind;
}): TrustEdge[] {
  let result = [...edges.values()];
  if (filter?.source) {
    const source = filter.source.trim();
    result = result.filter((e) => e.source === source);
  }
  if (filter?.target) {
    const target = filter.target.trim();
    result = result.filter((e) => e.target === target);
  }
  if (filter?.kind) {
    result = result.filter((e) => e.kind === filter.kind);
  }
  return result.map(cloneEdge);
}

export function unlinkFederations(
  sourceId: string,
  targetId: string,
  kind?: TrustEdgeKind,
): number {
  const source = sourceId.trim();
  const target = targetId.trim();
  let removed = 0;

  if (kind) {
    assertEdgeKind(kind);
    if (edges.delete(edgeKey(source, target, kind))) removed += 1;
    return removed;
  }

  for (const [key, edge] of edges) {
    if (edge.source === source && edge.target === target) {
      edges.delete(key);
      removed += 1;
    }
  }
  return removed;
}

export function clearTrustGraph(): void {
  edges.clear();
}
