import {
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  TENDER_KNOWLEDGE_GRAPH_P4_TAG,
  TKG_MIN_TENDER_COUNT,
} from "../shared/constants";
import { buildTenderKnowledgeEngineCompatibility } from "../tender-engine-compat";
import { buildTenderRegistryRecords } from "../tender-registry";
import { validateTenderIntelligenceNetworkPhase1 } from "../tender-validation";
import { validateCompetitionGraph, validateTenderIntelligenceNetworkPhase2 } from "../competition/competition-validation";
import { validateTenderIntelligenceNetworkPhase3 } from "../optimization/optimization-validation";
import type { BidStrategyValidation, TenderKnowledgeGraphPhase4Validation } from "./bid-strategy-types";
import { runBidDecisionEngine } from "./bid-decision-engine";
import { buildBidStrategyContext } from "./bid-strategy-context";
import { generateBidStrategies } from "./bid-strategy-builder";
import { rankBidStrategies } from "./bid-strategy-ranking";
import { simulateBidStrategy } from "./bid-strategy-simulation";

let cachedPhase4Validation: TenderKnowledgeGraphPhase4Validation | undefined;

function validateBidStrategyContextLayer(): BidStrategyValidation {
  const tenders = buildTenderRegistryRecords();
  const contexts = tenders.map((tender) => buildBidStrategyContext(tender.tenderId));
  const valid =
    contexts.length >= TKG_MIN_TENDER_COUNT &&
    contexts.every((ctx) => ctx.contextReady);

  return {
    valid,
    count: contexts.length,
    summary: `bid-strategy-context ready=${contexts.filter((c) => c.contextReady).length}/${contexts.length} valid=${valid}`,
  };
}

function validateBidStrategiesLayer(): BidStrategyValidation {
  const tenders = buildTenderRegistryRecords();
  const all = tenders.map((tender) => generateBidStrategies(tender.tenderId));
  const valid =
    all.length >= TKG_MIN_TENDER_COUNT &&
    all.every((strategies) => strategies.length >= 6);

  return {
    valid,
    count: all.reduce((sum, strategies) => sum + strategies.length, 0),
    summary: `bid-strategies tenders=${all.length} kinds=6 valid=${valid}`,
  };
}

function validateBidRankingLayer(): BidStrategyValidation {
  const tenders = buildTenderRegistryRecords();
  const rankings = tenders.map((tender) => rankBidStrategies(tender.tenderId));
  const valid =
    rankings.length >= TKG_MIN_TENDER_COUNT &&
    rankings.every((ranking) => ranking.entries.length >= 6 && Boolean(ranking.optimalStrategy));

  return {
    valid,
    count: rankings.length,
    summary: `bid-ranking ranked=${rankings.length} valid=${valid}`,
  };
}

function validateBidSimulationLayer(): BidStrategyValidation {
  const ranking = rankBidStrategies(CANONICAL_TENDER_GRAPH_TENDER_ID);
  const simulation = simulateBidStrategy(
    CANONICAL_TENDER_GRAPH_TENDER_ID,
    ranking.optimalStrategy.bidStrategyId,
  );
  const valid = Boolean(simulation) && typeof simulation!.winProbabilityDelta === "number";

  return {
    valid,
    count: simulation ? 1 : 0,
    summary: `bid-simulation strategy=${ranking.optimalStrategy.strategyKind} delta=${simulation?.winProbabilityDelta ?? 0} valid=${valid}`,
  };
}

function validateBidDecisionLayer(): BidStrategyValidation {
  const tenders = buildTenderRegistryRecords();
  const decisions = tenders.map((tender) => runBidDecisionEngine(tender.tenderId));
  const valid =
    decisions.length >= TKG_MIN_TENDER_COUNT &&
    decisions.every((d) => Boolean(d.recommendation) && Boolean(d.ranking.optimalStrategy));

  return {
    valid,
    count: decisions.length,
    summary: `bid-decision decided=${decisions.length} valid=${valid}`,
  };
}

function validateBidCompatibility(): BidStrategyValidation {
  const compatibility = buildTenderKnowledgeEngineCompatibility();
  const phase1 = validateTenderIntelligenceNetworkPhase1();
  const phase2 = validateTenderIntelligenceNetworkPhase2();
  const phase3 = validateTenderIntelligenceNetworkPhase3();
  const competitionGraph = validateCompetitionGraph();

  const valid =
    phase1.valid &&
    phase2.valid &&
    phase3.valid &&
    competitionGraph.valid &&
    Boolean(compatibility.brandIntelligenceLayer) &&
    Boolean(compatibility.evidenceIntelligenceLayer) &&
    Boolean(compatibility.requirementIntelligenceLayer);

  return {
    valid,
    count: 4,
    summary: `bid-compatibility p1=${phase1.valid} p2=${phase2.valid} p3=${phase3.valid} competition=${competitionGraph.valid} valid=${valid}`,
  };
}

export function validateBidStrategy(): BidStrategyValidation {
  const phase4 = validateTenderIntelligenceNetworkPhase4();
  return {
    valid: phase4.valid,
    count: phase4.bidDecision.count,
    summary: `bid-strategy valid=${phase4.valid}`,
  };
}

export function validateTenderIntelligenceNetworkPhase4(): TenderKnowledgeGraphPhase4Validation {
  if (cachedPhase4Validation) return cachedPhase4Validation;

  const bidStrategyContext = validateBidStrategyContextLayer();
  const bidStrategies = validateBidStrategiesLayer();
  const bidRanking = validateBidRankingLayer();
  const bidSimulation = validateBidSimulationLayer();
  const bidDecision = validateBidDecisionLayer();
  const compatibility = validateBidCompatibility();

  cachedPhase4Validation = {
    valid:
      bidStrategyContext.valid &&
      bidStrategies.valid &&
      bidRanking.valid &&
      bidSimulation.valid &&
      bidDecision.valid &&
      compatibility.valid,
    bidStrategyContext,
    bidStrategies,
    bidRanking,
    bidSimulation,
    bidDecision,
    compatibility,
  };

  return cachedPhase4Validation;
}

export function getTenderKnowledgeGraphPhase4FreezeMeta() {
  return {
    version: "v41-tender-knowledge-graph-4" as const,
    tag: TENDER_KNOWLEDGE_GRAPH_P4_TAG,
  };
}
