import { buildEvidenceRegistryRecords } from "../evidence-registry";
import type { EvidenceIntelligenceMode } from "../shared/types";
import {
  buildBrandEvidenceEdges,
  buildBrandManufacturerEdges,
  buildBrandSkuEdges,
} from "./brand-evidence-edge";
import {
  buildEvidenceGraphNodeId,
  buildEvidenceGraphNodeRecords,
  buildRequirementStubNodeId,
  type EvidenceGraphNode,
  type GraphNodeType,
} from "./graph-nodes";
import {
  dedupeGraphEdges,
  indexGraphEdges,
  indexGraphEdgesBySource,
  type EvidenceGraphEdge,
} from "./graph-edges";
import { buildManufacturerEvidenceEdges } from "./manufacturer-evidence-edge";
import { buildSkuEvidenceEdges } from "./sku-evidence-edge";

export interface EvidenceGraph {
  graphId: string;
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  nodeCount: number;
  edgeCount: number;
  graphReady: boolean;
  mode: EvidenceIntelligenceMode;
}

export interface EvidenceGraphContext {
  contextId: string;
  graph: EvidenceGraph;
  nodeCount: number;
  edgeCount: number;
  brandCount: number;
  evidenceCount: number;
  skuCount: number;
  manufacturerCount: number;
  averageDegree: number;
  graphDensity: number;
  isolatedNodeCount: number;
  requirementStubPathCount: number;
  contextReady: boolean;
  mode: EvidenceIntelligenceMode;
}

function buildEvidenceRequirementStubEdges(): EvidenceGraphEdge[] {
  return buildEvidenceRegistryRecords()
    .filter((record) => record.score.totalEvidenceScore >= 78)
    .slice(0, 6)
    .map((record) => ({
      edgeId: `edge-evidence-req-stub-${record.evidenceId}`,
      edgeType: "evidence-requirement-stub" as const,
      sourceNodeId: buildEvidenceGraphNodeId(record.evidenceId),
      targetNodeId: buildRequirementStubNodeId(record.evidenceId),
      sourceRecordId: record.evidenceId,
      traceRef: `req-stub-${record.evidenceRef}`,
      direction: "forward" as const,
      mode: "evidence-intelligence-network" as const,
    }));
}

export function buildEvidenceGraphEdges(): EvidenceGraphEdge[] {
  return dedupeGraphEdges([
    ...buildBrandEvidenceEdges(),
    ...buildSkuEvidenceEdges(),
    ...buildManufacturerEvidenceEdges(),
    ...buildBrandSkuEdges(),
    ...buildBrandManufacturerEdges(),
    ...buildEvidenceRequirementStubEdges(),
  ]);
}

export function buildEvidenceGraph(): EvidenceGraph {
  const nodes = buildEvidenceGraphNodeRecords();
  const edges = buildEvidenceGraphEdges();

  return {
    graphId: "evidence-graph-v39-p2",
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    graphReady: nodes.length >= 40 && edges.length >= 50,
    mode: "evidence-intelligence-network",
  };
}

function countNodesByType(nodes: EvidenceGraphNode[], nodeType: GraphNodeType): number {
  return nodes.filter((node) => node.nodeType === nodeType).length;
}

function computeIsolatedNodeCount(graph: EvidenceGraph): number {
  const connected = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.edgeType === "evidence-requirement-stub") continue;
    connected.add(edge.sourceNodeId);
    connected.add(edge.targetNodeId);
  }
  return graph.nodes.filter((node) => !connected.has(node.nodeId)).length;
}

function computeAverageDegree(graph: EvidenceGraph): number {
  if (graph.nodeCount === 0) return 0;
  const degree = new Map<string, number>();
  for (const edge of graph.edges) {
    if (edge.edgeType === "evidence-requirement-stub") continue;
    degree.set(edge.sourceNodeId, (degree.get(edge.sourceNodeId) ?? 0) + 1);
    if (edge.direction === "bidirectional") {
      degree.set(edge.targetNodeId, (degree.get(edge.targetNodeId) ?? 0) + 1);
    } else {
      degree.set(edge.targetNodeId, (degree.get(edge.targetNodeId) ?? 0) + 1);
    }
  }
  const total = [...degree.values()].reduce((sum, value) => sum + value, 0);
  return Math.round((total / graph.nodeCount) * 100) / 100;
}

function computeGraphDensity(graph: EvidenceGraph): number {
  if (graph.nodeCount <= 1) return 0;
  const structuralEdges = graph.edges.filter((edge) => edge.edgeType !== "evidence-requirement-stub");
  const maxEdges = graph.nodeCount * (graph.nodeCount - 1);
  return Math.round((structuralEdges.length / maxEdges) * 10000) / 10000;
}

export function countBrandEvidenceRequirementStubPaths(graph: EvidenceGraph): number {
  let count = 0;

  for (const edge of graph.edges) {
    if (edge.edgeType !== "brand-evidence") continue;
    const stubEdge = graph.edges.find(
      (candidate) =>
        candidate.edgeType === "evidence-requirement-stub" &&
        candidate.sourceNodeId === edge.targetNodeId,
    );
    if (stubEdge) count += 1;
  }

  return count;
}

export function buildEvidenceGraphContext(): EvidenceGraphContext {
  const graph = buildEvidenceGraph();
  const brandCount = countNodesByType(graph.nodes, "brand");
  const evidenceCount = countNodesByType(graph.nodes, "evidence");
  const skuCount = countNodesByType(graph.nodes, "sku");
  const manufacturerCount = countNodesByType(graph.nodes, "manufacturer");
  const isolatedNodeCount = computeIsolatedNodeCount(graph);
  const requirementStubPathCount = countBrandEvidenceRequirementStubPaths(graph);

  const evidenceNodes = graph.nodes.filter((node) => node.nodeType === "evidence");
  const evidenceConnected = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.edgeType === "evidence-requirement-stub") continue;
    if (edge.targetNodeId.startsWith("graph-node-evidence-")) {
      evidenceConnected.add(edge.targetNodeId);
    }
    if (edge.sourceNodeId.startsWith("graph-node-evidence-")) {
      evidenceConnected.add(edge.sourceNodeId);
    }
  }
  const noIsolatedEvidence = evidenceNodes.every((node) => evidenceConnected.has(node.nodeId));

  const contextReady =
    graph.graphReady &&
    brandCount >= 8 &&
    evidenceCount >= 30 &&
    isolatedNodeCount === 0 &&
    noIsolatedEvidence &&
    requirementStubPathCount >= 3;

  return {
    contextId: "evidence-graph-context-v39-p2",
    graph,
    nodeCount: graph.nodeCount,
    edgeCount: graph.edgeCount,
    brandCount,
    evidenceCount,
    skuCount,
    manufacturerCount,
    averageDegree: computeAverageDegree(graph),
    graphDensity: computeGraphDensity(graph),
    isolatedNodeCount,
    requirementStubPathCount,
    contextReady,
    mode: "evidence-intelligence-network",
  };
}

export function getEvidenceGraphIndexes(graph: EvidenceGraph) {
  return {
    nodesById: new Map(graph.nodes.map((node) => [node.nodeId, node])),
    edgesById: indexGraphEdges(graph.edges),
    edgesBySource: indexGraphEdgesBySource(graph.edges),
  };
}
