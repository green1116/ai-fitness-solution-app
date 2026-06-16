import { buildSupplierLinkRecords } from "@/lib/brand-intelligence-network";
import { buildTenderRegistryRecords } from "../tender-registry";
import {
  TKG_MIN_ALTERNATIVE_SOLUTION_COUNT,
  TKG_MIN_COMPETITOR_BRAND_COUNT,
  TKG_MIN_COMPETITOR_SUPPLIER_COUNT,
  TKG_MIN_TENDER_COUNT,
} from "../shared/constants";
import type {
  CompetitionEdge,
  CompetitionGraph,
  CompetitionGraphContext,
  CompetitionGraphNode,
  CompetitorBrandNode,
} from "./competition-types";
import { buildAllAlternativeSolutionNodes } from "./alternative-solution-node";
import { buildAllCompetitorBrandNodes } from "./competitor-brand-node";
import { buildCompetitorSupplierNodes } from "./competitor-supplier-node";
import {
  buildCompetitionEdge,
  buildCompetitorBrandAlternativeEdgeId,
  buildCompetitorBrandSupplierEdgeId,
  buildCompetitionTenderRootNodeId,
  buildTenderCompetitorBrandEdgeId,
  dedupeCompetitionEdges,
} from "./competition-edge";
import {
  buildAlternativeSolutionNodeId,
  buildCompetitorBrandNodeId,
  buildCompetitorSupplierNodeId,
} from "./competition-node";

export function buildCompetitionGraphEdges(): CompetitionEdge[] {
  const edges: CompetitionEdge[] = [];
  const seen = new Set<string>();
  const brandNodes = buildAllCompetitorBrandNodes();
  const alternativeNodes = buildAllAlternativeSolutionNodes();

  for (const brandNode of brandNodes) {
    const edgeId = buildTenderCompetitorBrandEdgeId(brandNode.tenderId, brandNode.brandId);
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    edges.push(
      buildCompetitionEdge({
        edgeId,
        type: "tender-competitor-brand",
        sourceId: brandNode.tenderId,
        targetId: brandNode.brandId,
        sourceNodeId: buildCompetitionTenderRootNodeId(brandNode.tenderId),
        targetNodeId: buildCompetitorBrandNodeId(brandNode.tenderId, brandNode.brandId),
        weight: brandNode.winPressure,
        traceRef: brandNode.brandId,
        tenderId: brandNode.tenderId,
      }),
    );
  }

  for (const brandNode of brandNodes) {
    for (const link of buildSupplierLinkRecords().filter((l) => l.brandId === brandNode.brandId)) {
      const edgeId = buildCompetitorBrandSupplierEdgeId(
        `${brandNode.tenderId}-${brandNode.brandId}`,
        link.supplierId,
      );
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      edges.push(
        buildCompetitionEdge({
          edgeId,
          type: "competitor-brand-supplier",
          sourceId: brandNode.brandId,
          targetId: link.supplierId,
          sourceNodeId: buildCompetitorBrandNodeId(brandNode.tenderId, brandNode.brandId),
          targetNodeId: buildCompetitorSupplierNodeId(
            link.supplierId,
            link.brandId,
            brandNode.tenderId,
          ),
          weight: 60,
          traceRef: link.linkId,
          tenderId: brandNode.tenderId,
        }),
      );
    }
  }

  for (const altNode of alternativeNodes) {
    for (const brandId of [altNode.sourceBrandId, altNode.targetBrandId]) {
      const edgeId = buildCompetitorBrandAlternativeEdgeId(brandId, altNode.alternativeId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      edges.push(
        buildCompetitionEdge({
          edgeId,
          type: "competitor-brand-alternative",
          sourceId: brandId,
          targetId: altNode.alternativeId,
          sourceNodeId: buildCompetitorBrandNodeId(altNode.tenderId, brandId),
          targetNodeId: buildAlternativeSolutionNodeId(altNode.alternativeId),
          weight: altNode.alternativeRisk,
          traceRef: altNode.alternativeId,
          tenderId: altNode.tenderId,
        }),
      );
    }
  }

  return dedupeCompetitionEdges(edges);
}

let cachedCompetitionGraph: CompetitionGraph | undefined;

export function buildCompetitionGraph(): CompetitionGraph {
  if (cachedCompetitionGraph) return cachedCompetitionGraph;

  const brandNodes = buildAllCompetitorBrandNodes();
  const supplierNodes = buildCompetitorSupplierNodes(brandNodes);
  const alternativeNodes = buildAllAlternativeSolutionNodes();
  const edges = buildCompetitionGraphEdges();

  const nodes: CompetitionGraphNode[] = [...brandNodes, ...supplierNodes, ...alternativeNodes];

  cachedCompetitionGraph = {
    graphId: "tender-knowledge-graph-competition-v41-p2",
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    graphReady:
      buildTenderRegistryRecords().length >= TKG_MIN_TENDER_COUNT &&
      brandNodes.length >= TKG_MIN_COMPETITOR_BRAND_COUNT &&
      supplierNodes.length >= TKG_MIN_COMPETITOR_SUPPLIER_COUNT &&
      alternativeNodes.length >= TKG_MIN_ALTERNATIVE_SOLUTION_COUNT &&
      edges.length >= 20,
    mode: "tender-knowledge-graph",
  };

  return cachedCompetitionGraph;
}

let cachedCompetitionGraphContext: CompetitionGraphContext | undefined;

export function buildCompetitionGraphContext(): CompetitionGraphContext {
  if (cachedCompetitionGraphContext) return cachedCompetitionGraphContext;

  const graph = buildCompetitionGraph();
  const tenders = buildTenderRegistryRecords();
  const brandNodes = graph.nodes.filter((node) => node.nodeType === "competitor-brand");
  const supplierNodes = graph.nodes.filter((node) => node.nodeType === "competitor-supplier");
  const alternativeNodes = graph.nodes.filter((node) => node.nodeType === "alternative-solution");

  const pathsPerTender = tenders.map((tender) =>
    graph.edges.filter((edge) => edge.tenderId === tender.tenderId).length,
  );
  const avgCompetitionPathsPerTender =
    pathsPerTender.length === 0
      ? 0
      : Math.round(
          (pathsPerTender.reduce((sum, count) => sum + count, 0) / pathsPerTender.length) * 100,
        ) / 100;

  const dominantCount = tenders.filter((tender) => {
    const tenderBrands = graph.nodes.filter(
      (node): node is CompetitorBrandNode =>
        node.nodeType === "competitor-brand" && node.tenderId === tender.tenderId,
    );
    return tenderBrands.length > 0;
  }).length;
  const dominantCompetitorCoverage =
    tenders.length === 0 ? 0 : Math.round((dominantCount / tenders.length) * 100);

  const contextReady =
    graph.graphReady &&
    tenders.length >= TKG_MIN_TENDER_COUNT &&
    brandNodes.length >= TKG_MIN_COMPETITOR_BRAND_COUNT &&
    supplierNodes.length >= TKG_MIN_COMPETITOR_SUPPLIER_COUNT &&
    alternativeNodes.length >= TKG_MIN_ALTERNATIVE_SOLUTION_COUNT &&
    dominantCompetitorCoverage === 100 &&
    avgCompetitionPathsPerTender >= 1;

  cachedCompetitionGraphContext = {
    contextId: "tender-knowledge-graph-competition-context-v41-p2",
    graph,
    tenderCount: tenders.length,
    competitorBrandCount: brandNodes.length,
    competitorSupplierCount: supplierNodes.length,
    alternativeSolutionCount: alternativeNodes.length,
    avgCompetitionPathsPerTender,
    dominantCompetitorCoverage,
    contextReady,
    mode: "tender-knowledge-graph",
  };

  return cachedCompetitionGraphContext;
}
