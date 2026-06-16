import {
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  TENDER_KNOWLEDGE_GRAPH_P2_TAG,
  TKG_MIN_ALTERNATIVE_SOLUTION_COUNT,
  TKG_MIN_COMPETITOR_BRAND_COUNT,
  TKG_MIN_COMPETITOR_SUPPLIER_COUNT,
  TKG_MIN_TENDER_COUNT,
} from "../shared/constants";
import { buildTenderKnowledgeEngineCompatibility } from "../tender-engine-compat";
import { buildTenderRegistryRecords } from "../tender-registry";
import { validateTenderIntelligenceNetworkPhase1 } from "../tender-validation";
import type {
  CompetitionGraphValidation,
  TenderKnowledgeGraphPhase2Validation,
} from "./competition-types";
import {
  analyzeTenderCompetition,
  calculateWinPressure,
  findDominantCompetitor,
} from "./competition-analysis";
import { buildCompetitionGraphContext } from "./competition-graph-context";
import { traverseCompetitionGraph } from "./competition-graph-traversal";
import { buildCompetitionRankings } from "./competition-ranking";

let cachedPhase2Validation: TenderKnowledgeGraphPhase2Validation | undefined;

export function validateCompetitionGraph(): CompetitionGraphValidation {
  const context = buildCompetitionGraphContext();
  const graph = context.graph;

  const isolated = graph.nodes.filter((node) => {
    const connected = graph.edges.some(
      (edge) => edge.sourceNodeId === node.nodeId || edge.targetNodeId === node.nodeId,
    );
    return !connected;
  });

  const valid = context.contextReady && isolated.length === 0;

  return {
    valid,
    count: graph.edgeCount,
    summary: `competition-graph nodes=${graph.nodeCount} edges=${graph.edgeCount} brands=${context.competitorBrandCount} suppliers=${context.competitorSupplierCount} alternatives=${context.alternativeSolutionCount} valid=${valid}`,
  };
}

function validateCompetitionAnalysisLayer(): CompetitionGraphValidation {
  const tenders = buildTenderRegistryRecords();
  const results = tenders.map((tender) => analyzeTenderCompetition(tender.tenderId));

  const valid =
    results.length >= TKG_MIN_TENDER_COUNT &&
    results.every((result) => Boolean(result.riskSummary)) &&
    results.every((result) => typeof result.winProbabilityDelta === "number") &&
    results.every((result) => Boolean(result.dominantCompetitor));

  return {
    valid,
    count: results.length,
    summary: `competition-analysis analyzed=${results.length} dominant=${results.filter((r) => r.dominantCompetitor).length} valid=${valid}`,
  };
}

function validateCompetitionRankingLayer(): CompetitionGraphValidation {
  const rankings = buildCompetitionRankings(CANONICAL_TENDER_GRAPH_TENDER_ID);
  const valid =
    rankings.competitorBrandRankings.length >= 1 &&
    rankings.alternativeSolutionRankings.length >= 1;

  return {
    valid,
    count: rankings.competitorBrandRankings.length,
    summary: `competition-ranking brands=${rankings.competitorBrandRankings.length} suppliers=${rankings.competitorSupplierRankings.length} alternatives=${rankings.alternativeSolutionRankings.length} valid=${valid}`,
  };
}

function validateWinPressureLayer(): CompetitionGraphValidation {
  const tenders = buildTenderRegistryRecords();
  const pressures = tenders.map((tender) => calculateWinPressure(tender.tenderId));
  const valid =
    pressures.length >= TKG_MIN_TENDER_COUNT &&
    pressures.every((value) => value >= 0 && value <= 100);

  return {
    valid,
    count: pressures.length,
    summary: `win-pressure computed=${pressures.length} avg=${Math.round(pressures.reduce((s, v) => s + v, 0) / Math.max(pressures.length, 1))} valid=${valid}`,
  };
}

function validateCompetitionCompatibility(): CompetitionGraphValidation {
  const compatibility = buildTenderKnowledgeEngineCompatibility();
  const phase1 = validateTenderIntelligenceNetworkPhase1();
  const traversal = traverseCompetitionGraph(CANONICAL_TENDER_GRAPH_TENDER_ID);

  const valid =
    phase1.valid &&
    Boolean(compatibility.brandIntelligenceLayer) &&
    Boolean(compatibility.evidenceIntelligenceLayer) &&
    Boolean(compatibility.requirementIntelligenceLayer) &&
    traversal.pathCount >= 1 &&
    Boolean(findDominantCompetitor(CANONICAL_TENDER_GRAPH_TENDER_ID));

  return {
    valid,
    count: 4,
    summary: `competition-compatibility p1=${phase1.valid} traversal=${traversal.pathCount} valid=${valid}`,
  };
}

export function validateTenderIntelligenceNetworkPhase2(): TenderKnowledgeGraphPhase2Validation {
  if (cachedPhase2Validation) return cachedPhase2Validation;

  const competitionGraph = validateCompetitionGraph();
  const competitionAnalysis = validateCompetitionAnalysisLayer();
  const competitionRanking = validateCompetitionRankingLayer();
  const winPressure = validateWinPressureLayer();
  const compatibility = validateCompetitionCompatibility();

  cachedPhase2Validation = {
    valid:
      competitionGraph.valid &&
      competitionAnalysis.valid &&
      competitionRanking.valid &&
      winPressure.valid &&
      compatibility.valid,
    competitionGraph,
    competitionAnalysis,
    competitionRanking,
    winPressure,
    compatibility,
  };

  return cachedPhase2Validation;
}

export function getTenderKnowledgeGraphPhase2FreezeMeta() {
  return {
    version: "v41-tender-knowledge-graph-2" as const,
    tag: TENDER_KNOWLEDGE_GRAPH_P2_TAG,
    minCompetitorBrandCount: TKG_MIN_COMPETITOR_BRAND_COUNT,
    minCompetitorSupplierCount: TKG_MIN_COMPETITOR_SUPPLIER_COUNT,
    minAlternativeSolutionCount: TKG_MIN_ALTERNATIVE_SOLUTION_COUNT,
  };
}
