import type { EvidenceIntelligenceMode } from "../shared/types";

export type GraphEdgeType =
  | "brand-evidence"
  | "sku-evidence"
  | "manufacturer-evidence"
  | "brand-sku"
  | "brand-manufacturer"
  | "evidence-requirement-stub";

export interface GraphEdgeBase {
  edgeId: string;
  edgeType: GraphEdgeType;
  sourceNodeId: string;
  targetNodeId: string;
  sourceRecordId: string;
  traceRef: string;
  direction: "forward" | "bidirectional";
  mode: EvidenceIntelligenceMode;
}

export type EvidenceGraphEdge = GraphEdgeBase;

export function indexGraphEdges(edges: EvidenceGraphEdge[]): Map<string, EvidenceGraphEdge> {
  return new Map(edges.map((edge) => [edge.edgeId, edge]));
}

export function indexGraphEdgesBySource(
  edges: EvidenceGraphEdge[],
): Map<string, EvidenceGraphEdge[]> {
  const index = new Map<string, EvidenceGraphEdge[]>();
  for (const edge of edges) {
    const existing = index.get(edge.sourceNodeId) ?? [];
    existing.push(edge);
    index.set(edge.sourceNodeId, existing);
  }
  return index;
}

export function indexGraphEdgesByTarget(
  edges: EvidenceGraphEdge[],
): Map<string, EvidenceGraphEdge[]> {
  const index = new Map<string, EvidenceGraphEdge[]>();
  for (const edge of edges) {
    const existing = index.get(edge.targetNodeId) ?? [];
    existing.push(edge);
    index.set(edge.targetNodeId, existing);
  }
  return index;
}

export function dedupeGraphEdges(edges: EvidenceGraphEdge[]): EvidenceGraphEdge[] {
  const seen = new Set<string>();
  const deduped: EvidenceGraphEdge[] = [];

  for (const edge of edges) {
    if (seen.has(edge.edgeId)) continue;
    seen.add(edge.edgeId);
    deduped.push(edge);
  }

  return deduped;
}
