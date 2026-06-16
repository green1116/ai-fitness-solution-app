import type { TenderGraphEdge, TenderGraphEdgeType, TenderKnowledgeGraphMode } from "../shared/types";

export function dedupeTenderGraphEdges(edges: TenderGraphEdge[]): TenderGraphEdge[] {
  const seen = new Set<string>();
  const deduped: TenderGraphEdge[] = [];

  for (const edge of edges) {
    if (seen.has(edge.edgeId)) continue;
    seen.add(edge.edgeId);
    deduped.push(edge);
  }

  return deduped;
}

export function indexTenderGraphEdgesBySource(
  edges: TenderGraphEdge[],
): Map<string, TenderGraphEdge[]> {
  const index = new Map<string, TenderGraphEdge[]>();
  for (const edge of edges) {
    const bucket = index.get(edge.sourceNodeId) ?? [];
    bucket.push(edge);
    index.set(edge.sourceNodeId, bucket);
    if (edge.direction === "bidirectional") {
      const reverse = index.get(edge.targetNodeId) ?? [];
      reverse.push({ ...edge, sourceNodeId: edge.targetNodeId, targetNodeId: edge.sourceNodeId });
      index.set(edge.targetNodeId, reverse);
    }
  }
  return index;
}

export function buildTenderGraphEdge(input: {
  edgeId: string;
  type: TenderGraphEdgeType;
  sourceId: string;
  targetId: string;
  sourceNodeId: string;
  targetNodeId: string;
  weight: number;
  traceRef: string;
  sourceRecordId: string;
  direction?: "forward" | "bidirectional";
}): TenderGraphEdge {
  return {
    edgeId: input.edgeId,
    type: input.type,
    sourceId: input.sourceId,
    targetId: input.targetId,
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    weight: input.weight,
    traceRef: input.traceRef,
    sourceRecordId: input.sourceRecordId,
    direction: input.direction ?? "forward",
    mode: "tender-knowledge-graph" as TenderKnowledgeGraphMode,
  };
}
