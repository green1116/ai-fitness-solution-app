import type { RequirementIntelligenceMode } from "../shared/types";

export type RequirementGraphEdgeType =
  | "tender-requirement"
  | "requirement-evidence"
  | "requirement-brand";

export interface GraphEdgeBase {
  edgeId: string;
  edgeType: RequirementGraphEdgeType;
  sourceNodeId: string;
  targetNodeId: string;
  sourceRecordId: string;
  traceRef: string;
  direction: "forward" | "bidirectional";
  mode: RequirementIntelligenceMode;
}

export type RequirementGraphEdge = GraphEdgeBase;

export function indexRequirementGraphEdges(
  edges: RequirementGraphEdge[],
): Map<string, RequirementGraphEdge> {
  return new Map(edges.map((edge) => [edge.edgeId, edge]));
}

export function indexRequirementGraphEdgesBySource(
  edges: RequirementGraphEdge[],
): Map<string, RequirementGraphEdge[]> {
  const index = new Map<string, RequirementGraphEdge[]>();
  for (const edge of edges) {
    const bucket = index.get(edge.sourceNodeId) ?? [];
    bucket.push(edge);
    index.set(edge.sourceNodeId, bucket);
  }
  return index;
}

export function dedupeRequirementGraphEdges(edges: RequirementGraphEdge[]): RequirementGraphEdge[] {
  const seen = new Set<string>();
  const deduped: RequirementGraphEdge[] = [];

  for (const edge of edges) {
    if (seen.has(edge.edgeId)) continue;
    seen.add(edge.edgeId);
    deduped.push(edge);
  }

  return deduped;
}
