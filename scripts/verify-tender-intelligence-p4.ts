/**
 * V41 Tender Knowledge Graph — Phase 4 verification
 */
import {
  buildBidRecommendation,
  buildBidStrategyContext,
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  decideOptimalBidStrategy,
  generateBidStrategies,
  rankBidStrategies,
  runBidDecisionEngine,
  simulateBidStrategy,
  TENDER_KNOWLEDGE_GRAPH_P4_TAG,
  validateBidStrategy,
  validateTenderIntelligenceNetworkPhase4,
} from "../lib/tender-knowledge-graph";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateTenderIntelligenceNetworkPhase4();
assert(validation.valid, "phase4 validation");
assert(validation.bidStrategyContext.valid, "bid strategy context");
assert(validation.bidStrategies.valid, "bid strategies");
assert(validation.bidRanking.valid, "bid ranking");
assert(validation.bidSimulation.valid, "bid simulation");
assert(validation.bidDecision.valid, "bid decision");
assert(validation.compatibility.valid, "p1/p2/p3 compatibility");

const context = buildBidStrategyContext(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(context.contextReady, "bid context ready");
assert(context.brandStrength >= 0, "brand strength");
assert(context.requirementCoverage >= 0, "requirement coverage");
assert(context.evidenceReadiness >= 0, "evidence readiness");

const strategies = generateBidStrategies(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(strategies.length >= 6, "six bid strategy kinds");
assert(
  strategies.some((s) => s.strategyKind === "aggressive-bid"),
  "aggressive bid",
);
assert(
  strategies.some((s) => s.strategyKind === "balanced-bid"),
  "balanced bid",
);
assert(
  strategies.some((s) => s.strategyKind === "risk-mitigation-bid"),
  "risk mitigation bid",
);

const ranking = rankBidStrategies(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(ranking.entries.length >= 6, "bid ranking entries");
assert(Boolean(ranking.optimalStrategy), "optimal bid strategy");
assert(ranking.alternativeStrategies.length >= 1, "alternative bid strategies");

const optimal = decideOptimalBidStrategy(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(Boolean(optimal), "decideOptimalBidStrategy");

const simulation = simulateBidStrategy(
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  ranking.optimalStrategy.bidStrategyId,
);
assert(Boolean(simulation), "bid simulation");
assert(simulation!.winProbabilityDelta >= 0, "simulation delta");
assert(Boolean(simulation!.deltaExplanation), "delta explanation");

const recommendation = buildBidRecommendation(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(Boolean(recommendation.decisionSummary), "decision summary");
assert(Boolean(recommendation.gapSummary), "gap summary");
assert(recommendation.counterBidHints.length >= 1, "counter bid hints");

const decision = runBidDecisionEngine(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(decision.strategies.length >= 6, "decision engine strategies");
assert(Boolean(decision.recommendation), "decision recommendation");

assert(validateBidStrategy().valid, "validateBidStrategy");

console.log("✓ bid strategy context");
console.log(" ", validation.bidStrategyContext.summary);
console.log("✓ bid strategies");
console.log(" ", validation.bidStrategies.summary);
console.log("✓ bid ranking");
console.log(" ", validation.bidRanking.summary);
console.log("✓ bid simulation");
console.log(" ", validation.bidSimulation.summary);
console.log("✓ bid decision");
console.log(" ", validation.bidDecision.summary);
console.log("✓ compatibility");
console.log(" ", validation.compatibility.summary);
console.log(
  " ",
  `optimal=${ranking.optimalStrategy.strategyKind} score=${ranking.optimalStrategy.score.totalScore} decision=${decision.decisionLevel}`,
);
console.log(" ", `tag=${TENDER_KNOWLEDGE_GRAPH_P4_TAG}`);
console.log("Tender Knowledge Graph Phase 4 PASS");
