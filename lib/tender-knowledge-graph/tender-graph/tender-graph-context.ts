import type { TenderGraph, TenderGraphContext, TenderGraphNodeType } from "../shared/types";
import {
  TKG_MIN_BRAND_COUNT,
  TKG_MIN_EVIDENCE_COUNT,
  TKG_MIN_REQUIREMENT_COUNT,
  TKG_MIN_REQUIREMENT_EVIDENCE_COVERAGE,
  TKG_MIN_TENDER_BRAND_COVERAGE,
  TKG_MIN_TENDER_COUNT,
  TKG_MIN_TENDER_REQUIREMENT_COVERAGE,
} from "../shared/constants";
import { dedupeTenderGraphEdges } from "./graph-edges";
import { buildTenderGraphNodeRecords } from "./graph-nodes";
import {
  buildRequirementEvidenceEdges,
  collectLinkedEvidenceIdsFromTkgEdges,
} from "./requirement-evidence-edge";
import {
  buildRequirementBrandEdges,
  collectLinkedBrandIdsFromTkgEdges,
} from "./requirement-brand-edge";
import { buildTenderBrandEdges } from "./tender-brand-edge";
import { buildTenderRequirementEdges } from "./tender-requirement-edge";
import { buildTenderRegistryRecords } from "../tender-registry";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { calculateWinProbability, analyzeTenderRisk } from "../tender-scoring";

let cachedTenderGraph: TenderGraph | undefined;
let cachedTenderGraphContext: TenderGraphContext | undefined;

export function buildTenderGraphEdges() {
  return dedupeTenderGraphEdges([
    ...buildTenderRequirementEdges(),
    ...buildRequirementEvidenceEdges(),
    ...buildRequirementBrandEdges(),
    ...buildTenderBrandEdges(),
  ]);
}

export function buildTenderGraph(): TenderGraph {
  if (cachedTenderGraph) return cachedTenderGraph;

  const edges = buildTenderGraphEdges();
  const linkedEvidenceIds = collectLinkedEvidenceIdsFromTkgEdges(edges);
  const linkedBrandIds = collectLinkedBrandIdsFromTkgEdges(edges);
  const nodes = buildTenderGraphNodeRecords(linkedEvidenceIds, linkedBrandIds);

  cachedTenderGraph = {
    graphId: "tender-knowledge-graph-v41-p1",
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    graphReady:
      nodes.length >= 80 &&
      edges.length >= 100 &&
      countNodesByType(nodes, "tender") >= TKG_MIN_TENDER_COUNT,
    mode: "tender-knowledge-graph",
  };

  return cachedTenderGraph;
}

function countNodesByType(
  nodes: TenderGraph["nodes"],
  nodeType: TenderGraphNodeType,
): number {
  return nodes.filter((node) => node.nodeType === nodeType).length;
}

function computeIsolatedNodeCount(graph: TenderGraph): number {
  const connected = new Set<string>();
  for (const edge of graph.edges) {
    connected.add(edge.sourceNodeId);
    connected.add(edge.targetNodeId);
  }
  return graph.nodes.filter((node) => !connected.has(node.nodeId)).length;
}

function computeAverageDegree(graph: TenderGraph): number {
  if (graph.nodeCount === 0) return 0;
  const degree = new Map<string, number>();
  for (const edge of graph.edges) {
    degree.set(edge.sourceNodeId, (degree.get(edge.sourceNodeId) ?? 0) + 1);
    degree.set(edge.targetNodeId, (degree.get(edge.targetNodeId) ?? 0) + 1);
  }
  const total = [...degree.values()].reduce((sum, value) => sum + value, 0);
  return Math.round((total / graph.nodeCount) * 100) / 100;
}

function computeTenderRequirementCoverage(graph: TenderGraph): number {
  const tenders = buildTenderRegistryRecords();
  if (tenders.length === 0) return 0;

  const covered = tenders.filter((tender) =>
    graph.edges.some(
      (edge) => edge.type === "tender-requirement" && edge.sourceId === tender.tenderId,
    ),
  ).length;

  return Math.round((covered / tenders.length) * 100);
}

function computeRequirementEvidenceCoverage(graph: TenderGraph): number {
  const requirements = buildRequirementRegistryRecords();
  if (requirements.length === 0) return 0;

  const covered = requirements.filter((record) => {
    const nodeId = `tkg-node-requirement-${record.requirementId}`;
    return graph.edges.some(
      (edge) =>
        edge.sourceNodeId === nodeId &&
        (edge.type === "requirement-evidence" || edge.type === "requirement-brand"),
    );
  }).length;

  return Math.round((covered / requirements.length) * 100);
}

function computeTenderBrandCoverage(graph: TenderGraph): number {
  const tenders = buildTenderRegistryRecords();
  if (tenders.length === 0) return 0;

  const covered = tenders.filter((tender) =>
    graph.edges.some(
      (edge) => edge.type === "tender-brand" && edge.sourceId === tender.tenderId,
    ),
  ).length;

  return Math.round((covered / tenders.length) * 100);
}

export function buildTenderGraphContext(): TenderGraphContext {
  if (cachedTenderGraphContext) return cachedTenderGraphContext;

  const graph = buildTenderGraph();
  const tenderCount = countNodesByType(graph.nodes, "tender");
  const requirementCount = countNodesByType(graph.nodes, "requirement");
  const evidenceCount = countNodesByType(graph.nodes, "evidence");
  const brandCount = countNodesByType(graph.nodes, "brand");
  const isolatedNodeCount = computeIsolatedNodeCount(graph);

  const requirementNodes = graph.nodes.filter((node) => node.nodeType === "requirement");
  const connectedRequirements = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.sourceNodeId.startsWith("tkg-node-requirement-")) {
      connectedRequirements.add(edge.sourceNodeId);
    }
    if (edge.targetNodeId.startsWith("tkg-node-requirement-")) {
      connectedRequirements.add(edge.targetNodeId);
    }
  }
  const noIsolatedRequirements = requirementNodes.every((node) =>
    connectedRequirements.has(node.nodeId),
  );

  const winResults = buildTenderRegistryRecords().map((record) =>
    calculateWinProbability(record.tenderId),
  );
  const winDistribution = {
    high: winResults.filter((result) => result.winLevel === "high").length,
    medium: winResults.filter((result) => result.winLevel === "medium").length,
    low: winResults.filter((result) => result.winLevel === "low").length,
    blocked: winResults.filter((result) => result.winLevel === "blocked").length,
  };

  const riskResults = buildTenderRegistryRecords().map((record) =>
    analyzeTenderRisk(record.tenderId),
  );
  const riskDistribution = {
    low: riskResults.filter((result) => result.riskLevel === "low").length,
    medium: riskResults.filter((result) => result.riskLevel === "medium").length,
    high: riskResults.filter((result) => result.riskLevel === "high").length,
    critical: riskResults.filter((result) => result.riskLevel === "critical").length,
  };

  const tenderRequirementCoverage = computeTenderRequirementCoverage(graph);
  const requirementEvidenceCoverage = computeRequirementEvidenceCoverage(graph);
  const tenderBrandCoverage = computeTenderBrandCoverage(graph);

  const contextReady =
    graph.graphReady &&
    tenderCount >= TKG_MIN_TENDER_COUNT &&
    requirementCount >= TKG_MIN_REQUIREMENT_COUNT &&
    evidenceCount >= TKG_MIN_EVIDENCE_COUNT &&
    brandCount >= TKG_MIN_BRAND_COUNT &&
    isolatedNodeCount === 0 &&
    noIsolatedRequirements &&
    tenderRequirementCoverage >= TKG_MIN_TENDER_REQUIREMENT_COVERAGE &&
    requirementEvidenceCoverage >= TKG_MIN_REQUIREMENT_EVIDENCE_COVERAGE &&
    tenderBrandCoverage >= TKG_MIN_TENDER_BRAND_COVERAGE &&
    winResults.length === tenderCount;

  cachedTenderGraphContext = {
    contextId: "tender-knowledge-graph-context-v41-p1",
    graph,
    nodeCount: graph.nodeCount,
    edgeCount: graph.edgeCount,
    tenderCount,
    requirementCount,
    evidenceCount,
    brandCount,
    avgDegree: computeAverageDegree(graph),
    winDistribution,
    riskDistribution,
    tenderRequirementCoverage,
    requirementEvidenceCoverage,
    tenderBrandCoverage,
    contextReady,
    mode: "tender-knowledge-graph",
  };

  return cachedTenderGraphContext;
}

export { buildTenderGraphNodeId } from "./graph-nodes";
