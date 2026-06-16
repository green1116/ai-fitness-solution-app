import { EPI_CANONICAL_ID } from "../shared/constants";
import type { EquivalentMappingKind, EquivalentProductEdge } from "./equivalent-graph-types";

export function buildEquivalentProductEdgeId(
  sourceProductId: string,
  targetProductId: string,
  kind: EquivalentMappingKind,
): string {
  return `epi-equiv-edge-${sourceProductId}-${targetProductId}-${kind}`;
}

export function buildEquivalentProductEdge(input: {
  sourceProductId: string;
  targetProductId: string;
  kind: EquivalentMappingKind;
  score: number;
  confidence: number;
  reason: string[];
}): EquivalentProductEdge {
  return {
    edgeId: buildEquivalentProductEdgeId(
      input.sourceProductId,
      input.targetProductId,
      input.kind,
    ),
    sourceProductId: input.sourceProductId,
    targetProductId: input.targetProductId,
    kind: input.kind,
    score: input.score,
    confidence: input.confidence,
    reason: input.reason,
    mode: EPI_CANONICAL_ID,
  };
}

export function dedupeEquivalentEdges(edges: EquivalentProductEdge[]): EquivalentProductEdge[] {
  const byKey = new Map<string, EquivalentProductEdge>();

  for (const edge of edges) {
    const key = `${edge.sourceProductId}:${edge.targetProductId}:${edge.kind}`;
    const existing = byKey.get(key);
    if (!existing || edge.score > existing.score) {
      byKey.set(key, edge);
    }
  }

  return [...byKey.values()];
}
