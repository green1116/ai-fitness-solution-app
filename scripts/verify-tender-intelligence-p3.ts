/**
 * V41 Tender Knowledge Graph — Phase 3 verification
 */
import {
  buildTenderOptimizationGaps,
  buildTenderStrategyContext,
  buildTenderStrategyRecommendations,
  calculateWinProbabilityDelta,
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  rankTenderStrategies,
  simulateTenderStrategy,
  TENDER_KNOWLEDGE_GRAPH_P3_TAG,
  validateTenderIntelligenceNetworkPhase3,
  validateTenderOptimization,
} from "../lib/tender-knowledge-graph";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateTenderIntelligenceNetworkPhase3();
assert(validation.valid, "phase3 validation");
assert(validation.strategyContext.valid, "strategy context");
assert(validation.optimizationGaps.valid, "optimization gaps");
assert(validation.recommendations.valid, "recommendations");
assert(validation.strategyRanking.valid, "strategy ranking");
assert(validation.simulation.valid, "simulation");
assert(validation.winProbabilityDelta.valid, "win probability delta");
assert(validation.compatibility.valid, "p1/p2 compatibility");

const context = buildTenderStrategyContext(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(context.contextReady, "strategy context ready");
assert(context.baselineWinProbability >= 0, "baseline win probability");

const gaps = buildTenderOptimizationGaps(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(gaps.length >= 1, "optimization gaps");

const recommendations = buildTenderStrategyRecommendations(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(recommendations.length >= 1, "strategy recommendations");
assert(
  recommendations.some((rec) => rec.priority === "critical" || rec.priority === "high"),
  "high priority recommendation",
);

const ranking = rankTenderStrategies(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(ranking.entries.length >= 1, "strategy ranking entries");
assert(Boolean(ranking.topRecommendation), "top recommendation");
assert(ranking.secondaryRecommendations.length >= 0, "secondary recommendations");
assert(Boolean(ranking.gapSummary), "gap summary");
assert(Boolean(ranking.riskSummary), "risk summary");

const delta = calculateWinProbabilityDelta(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(delta >= 0 && delta <= 100, "win probability delta range");

const simulation = simulateTenderStrategy(
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  ranking.topRecommendation.strategyId,
);
assert(Boolean(simulation), "strategy simulation");
assert(simulation!.winProbabilityDelta >= 0, "simulation delta");
assert(Boolean(simulation!.deltaExplanation), "delta explanation");

assert(validateTenderOptimization().valid, "validateTenderOptimization");

console.log("✓ strategy context");
console.log(" ", validation.strategyContext.summary);
console.log("✓ optimization gaps");
console.log(" ", validation.optimizationGaps.summary);
console.log("✓ strategy ranking");
console.log(" ", validation.strategyRanking.summary);
console.log("✓ simulation");
console.log(" ", validation.simulation.summary);
console.log("✓ compatibility");
console.log(" ", validation.compatibility.summary);
console.log(
  " ",
  `top=${ranking.topRecommendation.strategyKind} score=${ranking.topRecommendation.scoreBreakdown.strategyScore} delta=${delta}`,
);
console.log(" ", `tag=${TENDER_KNOWLEDGE_GRAPH_P3_TAG}`);
console.log("Tender Knowledge Graph Phase 3 PASS");
