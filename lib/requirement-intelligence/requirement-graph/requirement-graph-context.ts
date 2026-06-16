import type { RequirementIntelligenceMode } from "../shared/types";
import { buildTenderRequirementEdges } from "./tender-requirement-edge";
import { buildRequirementBrandEdges } from "./requirement-brand-edge";
import {
  buildRequirementGraphNodeRecords,
  buildRequirementGraphNodeId,
  buildTenderGraphNodeId,
  buildEvidenceGraphNodeId,
  type RequirementGraphNode,
  type RequirementGraphNodeType,
} from "./graph-nodes";
import {
  dedupeRequirementGraphEdges,
  indexRequirementGraphEdgesBySource,
  type RequirementGraphEdge,
} from "./graph-edges";
import {
  buildRequirementEvidenceEdges,
  collectLinkedEvidenceIdsFromEdges,
} from "./requirement-evidence-edge";

export interface RequirementGraph {
  graphId: string;
  nodes: RequirementGraphNode[];
  edges: RequirementGraphEdge[];
  nodeCount: number;
  edgeCount: number;
  graphReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementGraphContext {
  contextId: string;
  graph: RequirementGraph;
  nodeCount: number;
  edgeCount: number;
  tenderCount: number;
  requirementCount: number;
  evidenceCount: number;
  brandCount: number;
  averageDegree: number;
  graphDensity: number;
  isolatedNodeCount: number;
  tenderEvidencePathCount: number;
  contextReady: boolean;
  mode: RequirementIntelligenceMode;
}

export function buildRequirementGraphEdges(): RequirementGraphEdge[] {
  return dedupeRequirementGraphEdges([
    ...buildTenderRequirementEdges(),
    ...buildRequirementEvidenceEdges(),
    ...buildRequirementBrandEdges(),
  ]);
}

let cachedRequirementGraph: RequirementGraph | undefined;

export function buildRequirementGraph(): RequirementGraph {
  if (cachedRequirementGraph) {
    return cachedRequirementGraph;
  }

  const tenderEdges = buildTenderRequirementEdges();
  const evidenceEdges = buildRequirementEvidenceEdges();
  const brandEdges = buildRequirementBrandEdges();
  const edges = dedupeRequirementGraphEdges([
    ...tenderEdges,
    ...evidenceEdges,
    ...brandEdges,
  ]);
  const linkedEvidenceIds = collectLinkedEvidenceIdsFromEdges(edges);
  const brandIds = new Set(
    edges
      .filter((edge) => edge.edgeType === "requirement-brand")
      .map((edge) => edge.traceRef),
  );
  const nodes = buildRequirementGraphNodeRecords(linkedEvidenceIds, brandIds);

  cachedRequirementGraph = {
    graphId: "requirement-graph-v40-p2",
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    graphReady: nodes.length >= 80 && edges.length >= 120,
    mode: "requirement-intelligence",
  };
  return cachedRequirementGraph;
}

function countNodesByType(
  nodes: RequirementGraphNode[],
  nodeType: RequirementGraphNodeType,
): number {
  return nodes.filter((node) => node.nodeType === nodeType).length;
}

function computeIsolatedNodeCount(graph: RequirementGraph): number {
  const connected = new Set<string>();
  for (const edge of graph.edges) {
    connected.add(edge.sourceNodeId);
    connected.add(edge.targetNodeId);
  }
  return graph.nodes.filter((node) => !connected.has(node.nodeId)).length;
}

function computeAverageDegree(graph: RequirementGraph): number {
  if (graph.nodeCount === 0) return 0;
  const degree = new Map<string, number>();
  for (const edge of graph.edges) {
    degree.set(edge.sourceNodeId, (degree.get(edge.sourceNodeId) ?? 0) + 1);
    degree.set(edge.targetNodeId, (degree.get(edge.targetNodeId) ?? 0) + 1);
  }
  const total = [...degree.values()].reduce((sum, value) => sum + value, 0);
  return Math.round((total / graph.nodeCount) * 100) / 100;
}

function computeGraphDensity(graph: RequirementGraph): number {
  if (graph.nodeCount <= 1) return 0;
  const maxEdges = graph.nodeCount * (graph.nodeCount - 1);
  return Math.round((graph.edges.length / maxEdges) * 10000) / 10000;
}

export function countTenderRequirementEvidencePaths(graph: RequirementGraph): number {
  let count = 0;

  for (const edge of graph.edges) {
    if (edge.edgeType !== "tender-requirement") continue;
    const evidenceEdge = graph.edges.find(
      (candidate) =>
        candidate.edgeType === "requirement-evidence" &&
        candidate.sourceNodeId === edge.targetNodeId,
    );
    if (evidenceEdge) count += 1;
  }

  return count;
}

export function buildRequirementGraphContext(): RequirementGraphContext {
  const graph = buildRequirementGraph();
  const tenderCount = countNodesByType(graph.nodes, "tender");
  const requirementCount = countNodesByType(graph.nodes, "requirement");
  const evidenceCount = countNodesByType(graph.nodes, "evidence");
  const brandCount = countNodesByType(graph.nodes, "brand");
  const isolatedNodeCount = computeIsolatedNodeCount(graph);
  const tenderEvidencePathCount = countTenderRequirementEvidencePaths(graph);

  const requirementNodes = graph.nodes.filter((node) => node.nodeType === "requirement");
  const connectedRequirements = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.sourceNodeId.startsWith("req-graph-node-requirement-")) {
      connectedRequirements.add(edge.sourceNodeId);
    }
    if (edge.targetNodeId.startsWith("req-graph-node-requirement-")) {
      connectedRequirements.add(edge.targetNodeId);
    }
  }
  const noIsolatedRequirements = requirementNodes.every((node) =>
    connectedRequirements.has(node.nodeId),
  );

  const contextReady =
    graph.graphReady &&
    tenderCount >= 15 &&
    requirementCount >= 50 &&
    evidenceCount >= 30 &&
    brandCount >= 8 &&
    isolatedNodeCount === 0 &&
    noIsolatedRequirements &&
    tenderEvidencePathCount >= 3;

  return {
    contextId: "requirement-graph-context-v40-p2",
    graph,
    nodeCount: graph.nodeCount,
    edgeCount: graph.edgeCount,
    tenderCount,
    requirementCount,
    evidenceCount,
    brandCount,
    averageDegree: computeAverageDegree(graph),
    graphDensity: computeGraphDensity(graph),
    isolatedNodeCount,
    tenderEvidencePathCount,
    contextReady,
    mode: "requirement-intelligence",
  };
}

export {
  buildTenderGraphNodeId,
  buildRequirementGraphNodeId,
  buildEvidenceGraphNodeId,
};
