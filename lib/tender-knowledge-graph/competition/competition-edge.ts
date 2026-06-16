import type { CompetitionEdge, CompetitionEdgeType } from "./competition-types";
import type { TenderKnowledgeGraphMode } from "../shared/types";
import {
  buildCompetitorBrandNodeId,
  buildCompetitorSupplierNodeId,
  buildAlternativeSolutionNodeId,
  buildCompetitionTenderRootNodeId,
} from "./competition-node";

export function buildCompetitionEdge(input: {
  edgeId: string;
  type: CompetitionEdgeType;
  sourceId: string;
  targetId: string;
  sourceNodeId: string;
  targetNodeId: string;
  weight: number;
  traceRef: string;
  tenderId: string;
  mode?: TenderKnowledgeGraphMode;
}): CompetitionEdge {
  return {
    edgeId: input.edgeId,
    type: input.type,
    sourceId: input.sourceId,
    targetId: input.targetId,
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    weight: input.weight,
    traceRef: input.traceRef,
    tenderId: input.tenderId,
    mode: input.mode ?? "tender-knowledge-graph",
  };
}

export function dedupeCompetitionEdges(edges: CompetitionEdge[]): CompetitionEdge[] {
  const seen = new Set<string>();
  const deduped: CompetitionEdge[] = [];
  for (const edge of edges) {
    if (seen.has(edge.edgeId)) continue;
    seen.add(edge.edgeId);
    deduped.push(edge);
  }
  return deduped;
}

export function indexCompetitionEdgesBySource(
  edges: CompetitionEdge[],
): Map<string, CompetitionEdge[]> {
  const index = new Map<string, CompetitionEdge[]>();
  for (const edge of edges) {
    const bucket = index.get(edge.sourceNodeId) ?? [];
    bucket.push(edge);
    index.set(edge.sourceNodeId, bucket);
  }
  return index;
}

export function buildTenderCompetitorBrandEdgeId(tenderId: string, brandId: string): string {
  return `tkg-comp-edge-tender-brand-${tenderId}-${brandId}`;
}

export function buildCompetitorBrandSupplierEdgeId(brandId: string, supplierId: string): string {
  return `tkg-comp-edge-brand-supplier-${brandId}-${supplierId}`;
}

export function buildCompetitorBrandAlternativeEdgeId(
  brandId: string,
  alternativeId: string,
): string {
  return `tkg-comp-edge-brand-alt-${brandId}-${alternativeId}`;
}

export {
  buildCompetitionTenderRootNodeId,
  buildCompetitorBrandNodeId,
  buildCompetitorSupplierNodeId,
  buildAlternativeSolutionNodeId,
};
