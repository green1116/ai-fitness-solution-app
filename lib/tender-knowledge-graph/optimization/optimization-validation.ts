import {
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  TENDER_KNOWLEDGE_GRAPH_P3_TAG,
  TKG_MIN_TENDER_COUNT,
} from "../shared/constants";
import { buildTenderKnowledgeEngineCompatibility } from "../tender-engine-compat";
import { buildTenderRegistryRecords } from "../tender-registry";
import { validateTenderIntelligenceNetworkPhase1 } from "../tender-validation";
import { validateCompetitionGraph, validateTenderIntelligenceNetworkPhase2 } from "../competition/competition-validation";
import type {
  TenderKnowledgeGraphPhase3Validation,
  TenderOptimizationValidation,
} from "./optimization-types";
import { buildTenderOptimizationGaps } from "./optimization-gap";
import { buildTenderStrategyRecommendations } from "./optimization-recommendation";
import { buildTenderStrategyContext } from "./strategy-context";
import { rankTenderStrategies } from "./strategy-ranking";
import { calculateWinProbabilityDelta, simulateTenderStrategy } from "./strategy-simulation";

let cachedPhase3Validation: TenderKnowledgeGraphPhase3Validation | undefined;

function validateStrategyContextLayer(): TenderOptimizationValidation {
  const tenders = buildTenderRegistryRecords();
  const contexts = tenders.map((tender) => buildTenderStrategyContext(tender.tenderId));
  const valid =
    contexts.length >= TKG_MIN_TENDER_COUNT &&
    contexts.every((ctx) => ctx.contextReady);

  return {
    valid,
    count: contexts.length,
    summary: `strategy-context ready=${contexts.filter((c) => c.contextReady).length}/${contexts.length} valid=${valid}`,
  };
}

function validateOptimizationGapsLayer(): TenderOptimizationValidation {
  const tenders = buildTenderRegistryRecords();
  const gapSets = tenders.map((tender) => buildTenderOptimizationGaps(tender.tenderId));
  const valid =
    gapSets.length >= TKG_MIN_TENDER_COUNT &&
    gapSets.every((gaps) => gaps.length >= 1);

  return {
    valid,
    count: gapSets.reduce((sum, gaps) => sum + gaps.length, 0),
    summary: `optimization-gaps tenders=${gapSets.length} avg=${Math.round(gapSets.reduce((s, g) => s + g.length, 0) / Math.max(gapSets.length, 1))} valid=${valid}`,
  };
}

function validateRecommendationsLayer(): TenderOptimizationValidation {
  const tenders = buildTenderRegistryRecords();
  const all = tenders.map((tender) => buildTenderStrategyRecommendations(tender.tenderId));
  const highPriorityCount = all.filter((recs) =>
    recs.some((rec) => rec.priority === "critical" || rec.priority === "high"),
  ).length;

  const valid =
    all.length >= TKG_MIN_TENDER_COUNT &&
    all.every((recs) => recs.length >= 1) &&
    highPriorityCount === all.length;

  return {
    valid,
    count: all.reduce((sum, recs) => sum + recs.length, 0),
    summary: `recommendations tenders=${all.length} highPriority=${highPriorityCount} valid=${valid}`,
  };
}

function validateStrategyRankingLayer(): TenderOptimizationValidation {
  const tenders = buildTenderRegistryRecords();
  const rankings = tenders.map((tender) => rankTenderStrategies(tender.tenderId));
  const valid =
    rankings.length >= TKG_MIN_TENDER_COUNT &&
    rankings.every((ranking) => ranking.entries.length >= 1 && Boolean(ranking.topRecommendation));

  return {
    valid,
    count: rankings.length,
    summary: `strategy-ranking ranked=${rankings.length} valid=${valid}`,
  };
}

function validateSimulationLayer(): TenderOptimizationValidation {
  const ranking = rankTenderStrategies(CANONICAL_TENDER_GRAPH_TENDER_ID);
  const simulation = simulateTenderStrategy(
    CANONICAL_TENDER_GRAPH_TENDER_ID,
    ranking.topRecommendation.strategyId,
  );
  const valid = Boolean(simulation) && typeof simulation!.winProbabilityDelta === "number";

  return {
    valid,
    count: simulation ? 1 : 0,
    summary: `simulation strategy=${ranking.topRecommendation.strategyId} delta=${simulation?.winProbabilityDelta ?? 0} valid=${valid}`,
  };
}

function validateWinProbabilityDeltaLayer(): TenderOptimizationValidation {
  const tenders = buildTenderRegistryRecords();
  const deltas = tenders.map((tender) => calculateWinProbabilityDelta(tender.tenderId));
  const valid =
    deltas.length >= TKG_MIN_TENDER_COUNT &&
    deltas.every((delta) => delta >= 0 && delta <= 100);

  return {
    valid,
    count: deltas.length,
    summary: `win-probability-delta computed=${deltas.length} avg=${Math.round(deltas.reduce((s, d) => s + d, 0) / Math.max(deltas.length, 1))} valid=${valid}`,
  };
}

function validateOptimizationCompatibility(): TenderOptimizationValidation {
  const compatibility = buildTenderKnowledgeEngineCompatibility();
  const phase1 = validateTenderIntelligenceNetworkPhase1();
  const phase2 = validateTenderIntelligenceNetworkPhase2();
  const competitionGraph = validateCompetitionGraph();

  const valid =
    phase1.valid &&
    phase2.valid &&
    competitionGraph.valid &&
    Boolean(compatibility.brandIntelligenceLayer) &&
    Boolean(compatibility.evidenceIntelligenceLayer) &&
    Boolean(compatibility.requirementIntelligenceLayer);

  return {
    valid,
    count: 3,
    summary: `optimization-compatibility p1=${phase1.valid} p2=${phase2.valid} competition=${competitionGraph.valid} valid=${valid}`,
  };
}

export function validateTenderOptimization(): TenderOptimizationValidation {
  const phase3 = validateTenderIntelligenceNetworkPhase3();
  return {
    valid: phase3.valid,
    count: phase3.strategyRanking.count,
    summary: `tender-optimization valid=${phase3.valid}`,
  };
}

export function validateTenderIntelligenceNetworkPhase3(): TenderKnowledgeGraphPhase3Validation {
  if (cachedPhase3Validation) return cachedPhase3Validation;

  const strategyContext = validateStrategyContextLayer();
  const optimizationGaps = validateOptimizationGapsLayer();
  const recommendations = validateRecommendationsLayer();
  const strategyRanking = validateStrategyRankingLayer();
  const simulation = validateSimulationLayer();
  const winProbabilityDelta = validateWinProbabilityDeltaLayer();
  const compatibility = validateOptimizationCompatibility();

  cachedPhase3Validation = {
    valid:
      strategyContext.valid &&
      optimizationGaps.valid &&
      recommendations.valid &&
      strategyRanking.valid &&
      simulation.valid &&
      winProbabilityDelta.valid &&
      compatibility.valid,
    strategyContext,
    optimizationGaps,
    recommendations,
    strategyRanking,
    simulation,
    winProbabilityDelta,
    compatibility,
  };

  return cachedPhase3Validation;
}

export function getTenderKnowledgeGraphPhase3FreezeMeta() {
  return {
    version: "v41-tender-knowledge-graph-3" as const,
    tag: TENDER_KNOWLEDGE_GRAPH_P3_TAG,
  };
}
