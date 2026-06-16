/**
 * V41 Tender Knowledge Graph — Phase 2 verification
 */
import {
  analyzeTenderCompetition,
  buildCompetitionGraph,
  buildCompetitionGraphContext,
  calculateWinPressure,
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  compareBrandsInTender,
  findDominantCompetitor,
  simulateWinScenario,
  TENDER_KNOWLEDGE_GRAPH_P2_TAG,
  traverseCompetitionGraph,
  validateCompetitionGraph,
  validateTenderIntelligenceNetworkPhase2,
} from "../lib/tender-knowledge-graph";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateTenderIntelligenceNetworkPhase2();
assert(validation.valid, "phase2 validation");
assert(validation.competitionGraph.valid, "competition graph");
assert(validation.competitionAnalysis.valid, "competition analysis");
assert(validation.competitionRanking.valid, "competition ranking");
assert(validation.winPressure.valid, "win pressure");
assert(validation.compatibility.valid, "v38/v39/v40/p1 compatibility");

const graph = buildCompetitionGraph();
assert(graph.graphReady, "competition graph ready");
assert(graph.nodeCount >= 24, "competition node count");
assert(graph.edgeCount >= 20, "competition edge count");

const context = buildCompetitionGraphContext();
assert(context.contextReady, "competition context ready");
assert(context.tenderCount >= 10, "tender count");
assert(context.competitorBrandCount >= 8, "competitor brand count");
assert(context.competitorSupplierCount >= 8, "competitor supplier count");
assert(context.alternativeSolutionCount >= 8, "alternative solution count");
assert(context.dominantCompetitorCoverage === 100, "dominant competitor coverage");
assert(context.avgCompetitionPathsPerTender >= 1, "competition paths per tender");

const traversal = traverseCompetitionGraph(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(traversal.pathCount >= 1, "competition traversal");
assert(traversal.competitorBrandNodeIds.length >= 1, "competitor brands visited");

const analysis = analyzeTenderCompetition(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(Boolean(analysis.dominantCompetitor), "dominant competitor");
assert(Boolean(analysis.riskSummary), "risk summary");
assert(typeof analysis.winProbabilityDelta === "number", "win probability delta");
assert(analysis.competitorBrandRankings.length >= 1, "brand rankings");
assert(analysis.bestCounterStrategyHints.length >= 1, "counter strategy hints");

const pressure = calculateWinPressure(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(pressure >= 0 && pressure <= 100, "win pressure range");

const comparison = compareBrandsInTender(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(comparison.competitionDensity >= 0, "competition density");
assert(comparison.riskPressureScore >= 0, "risk pressure score");

const dominant = findDominantCompetitor(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(Boolean(dominant), "findDominantCompetitor");

const simulation = simulateWinScenario(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(simulation.winProbabilityDelta > analysis.winProbabilityDelta - 30, "simulate win scenario");

assert(validateCompetitionGraph().valid, "validateCompetitionGraph");

console.log("✓ competition graph");
console.log(" ", validation.competitionGraph.summary);
console.log("✓ competition analysis");
console.log(" ", validation.competitionAnalysis.summary);
console.log("✓ win pressure");
console.log(" ", validation.winPressure.summary);
console.log("✓ compatibility");
console.log(" ", validation.compatibility.summary);
console.log(
  " ",
  `brands=${context.competitorBrandCount} suppliers=${context.competitorSupplierCount} alternatives=${context.alternativeSolutionCount} dominantCov=${context.dominantCompetitorCoverage}%`,
);
console.log(" ", `tag=${TENDER_KNOWLEDGE_GRAPH_P2_TAG}`);
console.log("Tender Knowledge Graph Phase 2 PASS");
