import type { TenderGraphPathResult, TenderGraphTraversalResult } from "../shared/types";
import { buildTenderGraph, buildTenderGraphNodeId } from "./tender-graph-context";
import { indexTenderGraphEdgesBySource } from "./graph-edges";
import type { TenderGraphEdge } from "../shared/types";

export function traverseTenderGraph(tenderId: string): TenderGraphTraversalResult {
  const graph = buildTenderGraph();
  const startNodeId = buildTenderGraphNodeId(tenderId);
  const edgesBySource = indexTenderGraphEdgesBySource(graph.edges);

  const visitedNodeIds: string[] = [];
  const visitedEdgeIds: string[] = [];
  const requirementNodeIds: string[] = [];
  const queue = [startNodeId];
  const seen = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedNodeIds.push(current);

    if (current.startsWith("tkg-node-requirement-")) {
      requirementNodeIds.push(current);
    }

    for (const edge of edgesBySource.get(current) ?? []) {
      if (!visitedEdgeIds.includes(edge.edgeId)) {
        visitedEdgeIds.push(edge.edgeId);
      }
      if (seen.has(edge.targetNodeId)) continue;
      seen.add(edge.targetNodeId);
      queue.push(edge.targetNodeId);
    }
  }

  return {
    tenderId,
    startNodeId,
    visitedNodeIds,
    visitedEdgeIds,
    requirementNodeIds,
    pathCount: requirementNodeIds.length,
  };
}

export function findTenderPath(
  sourceNodeId: string,
  targetNodeId: string,
): TenderGraphPathResult | undefined {
  const graph = buildTenderGraph();
  const edgesBySource = indexTenderGraphEdgesBySource(graph.edges);
  const queue: Array<{ nodeId: string; nodeIds: string[]; edgeIds: string[]; traceRefs: string[] }> =
    [{ nodeId: sourceNodeId, nodeIds: [sourceNodeId], edgeIds: [], traceRefs: [] }];
  const seen = new Set<string>([sourceNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.nodeId === targetNodeId) {
      return {
        sourceNodeId,
        targetNodeId,
        nodeIds: current.nodeIds,
        edgeIds: current.edgeIds,
        pathKind: resolvePathKind(current.edgeIds, graph.edges),
        traceRefs: current.traceRefs,
      };
    }

    for (const edge of edgesBySource.get(current.nodeId) ?? []) {
      if (seen.has(edge.targetNodeId)) continue;
      seen.add(edge.targetNodeId);
      queue.push({
        nodeId: edge.targetNodeId,
        nodeIds: [...current.nodeIds, edge.targetNodeId],
        edgeIds: [...current.edgeIds, edge.edgeId],
        traceRefs: [...current.traceRefs, edge.traceRef],
      });
    }
  }

  return undefined;
}

function resolvePathKind(edgeIds: string[], edges: TenderGraphEdge[]): string {
  const types = edgeIds
    .map((edgeId) => edges.find((edge) => edge.edgeId === edgeId)?.type)
    .filter(Boolean);

  if (types.includes("tender-brand")) return "tender-brand";
  if (types.includes("requirement-evidence")) return "tender-requirement-evidence";
  if (types.includes("tender-requirement")) return "tender-requirement";
  return "direct";
}
