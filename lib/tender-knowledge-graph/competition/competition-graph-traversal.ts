import type { CompetitionTraversalResult } from "./competition-types";
import { buildCompetitionGraph } from "./competition-graph-context";
import { indexCompetitionEdgesBySource } from "./competition-edge";
import { buildCompetitionTenderRootNodeId } from "./competition-node";

export function traverseCompetitionGraph(tenderId: string): CompetitionTraversalResult {
  const graph = buildCompetitionGraph();
  const startNodeId = buildCompetitionTenderRootNodeId(tenderId);
  const edgesBySource = indexCompetitionEdgesBySource(graph.edges);

  const visitedNodeIds: string[] = [];
  const visitedEdgeIds: string[] = [];
  const competitorBrandNodeIds: string[] = [];
  const queue = [startNodeId];
  const seen = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedNodeIds.push(current);

    if (current.includes("-comp-node-brand-")) {
      competitorBrandNodeIds.push(current);
    }

    for (const edge of edgesBySource.get(current) ?? []) {
      if (!visitedEdgeIds.includes(edge.edgeId)) {
        visitedEdgeIds.push(edge.edgeId);
      }
      if (edge.tenderId !== tenderId && edge.type !== "competitor-brand-supplier") continue;
      if (seen.has(edge.targetNodeId)) continue;
      seen.add(edge.targetNodeId);
      queue.push(edge.targetNodeId);
    }

    for (const edge of graph.edges) {
      if (edge.targetNodeId !== current) continue;
      if (edge.tenderId !== tenderId) continue;
      if (!visitedEdgeIds.includes(edge.edgeId)) {
        visitedEdgeIds.push(edge.edgeId);
      }
      if (seen.has(edge.sourceNodeId)) continue;
      seen.add(edge.sourceNodeId);
      queue.push(edge.sourceNodeId);
    }
  }

  return {
    tenderId,
    startNodeId,
    visitedNodeIds,
    visitedEdgeIds,
    competitorBrandNodeIds,
    pathCount: visitedEdgeIds.length,
  };
}
