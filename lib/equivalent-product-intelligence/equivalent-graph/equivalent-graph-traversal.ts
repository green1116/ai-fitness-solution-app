import { findProductById } from "../product-foundation/product-registry";
import {
  EPI_CANONICAL_ID,
  EPI_P2_TRAVERSAL_MAX_HOPS,
  EPI_P2_TRAVERSAL_SCORE_THRESHOLD,
} from "../shared/constants";
import { buildAllEquivalentProductEdges } from "./equivalent-mapping-builder";
import type { EquivalentTraversalHop, EquivalentTraversalResult } from "./equivalent-graph-types";

function isCrossBrandEdge(
  sourceProductId: string,
  targetProductId: string,
  productsById: Map<string, { brandId?: string }>,
): boolean {
  const source = productsById.get(sourceProductId);
  const target = productsById.get(targetProductId);
  if (!source?.brandId || !target?.brandId) return false;
  return source.brandId !== target.brandId;
}

export function traverseEquivalentGraph(
  productId: string,
  options?: {
    maxHops?: number;
    scoreThreshold?: number;
    crossBrandOnly?: boolean;
  },
): EquivalentTraversalResult {
  const maxHops = options?.maxHops ?? EPI_P2_TRAVERSAL_MAX_HOPS;
  const scoreThreshold = options?.scoreThreshold ?? EPI_P2_TRAVERSAL_SCORE_THRESHOLD;
  const crossBrandOnly = options?.crossBrandOnly ?? false;

  const allEdges = buildAllEquivalentProductEdges();
  const productsById = new Map(
    allEdges.flatMap((edge) => [
      [edge.sourceProductId, findProductById(edge.sourceProductId)],
      [edge.targetProductId, findProductById(edge.targetProductId)],
    ]).filter((entry): entry is [string, NonNullable<ReturnType<typeof findProductById>>] =>
      Boolean(entry[1]),
    ),
  );

  const adjacency = new Map<string, typeof allEdges>();
  for (const edge of allEdges) {
    if (edge.score < scoreThreshold) continue;
    if (crossBrandOnly && !isCrossBrandEdge(edge.sourceProductId, edge.targetProductId, productsById)) {
      continue;
    }
    const list = adjacency.get(edge.sourceProductId) ?? [];
    list.push(edge);
    adjacency.set(edge.sourceProductId, list);
  }

  const hops: EquivalentTraversalHop[] = [];
  const visited = new Set<string>([productId]);
  let frontier = [productId];

  for (let hop = 1; hop <= maxHops; hop += 1) {
    const nextFrontier: string[] = [];

    for (const currentId of frontier) {
      const edges = adjacency.get(currentId) ?? [];
      for (const edge of edges) {
        if (visited.has(edge.targetProductId)) continue;
        visited.add(edge.targetProductId);
        nextFrontier.push(edge.targetProductId);
        hops.push({
          hop,
          productId: edge.targetProductId,
          edgeKind: edge.kind,
          score: edge.score,
          path: [productId, edge.targetProductId],
        });
      }
    }

    frontier = nextFrontier;
    if (frontier.length === 0) break;
  }

  const crossBrandCount = hops.filter((hop) => {
    const edge = allEdges.find(
      (candidate) =>
        candidate.sourceProductId === productId &&
        candidate.targetProductId === hop.productId,
    );
    return edge
      ? isCrossBrandEdge(edge.sourceProductId, edge.targetProductId, productsById)
      : false;
  }).length;

  return {
    traversalId: `epi-traversal-${productId}`,
    sourceProductId: productId,
    hops,
    crossBrandCount,
    mode: EPI_CANONICAL_ID,
  };
}
