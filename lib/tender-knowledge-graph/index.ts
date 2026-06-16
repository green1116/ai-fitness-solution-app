/**
 * V41 Tender Knowledge Graph — Phase 1 + Phase 2.
 * Read-only extension over V38 Brand / V39 Evidence / V40 Requirement Intelligence.
 */
export * from "./shared/constants";
export * from "./shared/types";
export * from "./tender-engine-compat";
export {
  buildTenderRegistryRecords,
  buildTenderRegistry,
  findTenderGraphRecordById,
  validateTenderRegistry,
} from "./tender-registry";
export * from "./tender-context";
export * from "./tender-query";
export * from "./tender-scoring";
export * from "./tender-validation";
export * from "./tender-graph/graph-nodes";
export * from "./tender-graph/graph-edges";
export * from "./tender-graph/tender-requirement-edge";
export * from "./tender-graph/requirement-evidence-edge";
export * from "./tender-graph/requirement-brand-edge";
export * from "./tender-graph/tender-brand-edge";
export {
  buildTenderGraph,
  buildTenderGraphContext,
  buildTenderGraphEdges,
} from "./tender-graph/tender-graph-context";
export {
  traverseTenderGraph,
  findTenderPath,
} from "./tender-graph/tender-graph-traversal";
export * from "./competition/competition-types";
export * from "./competition/competition-node";
export * from "./competition/competition-edge";
export * from "./competition/competitor-brand-node";
export * from "./competition/competitor-supplier-node";
export * from "./competition/alternative-solution-node";
export {
  buildCompetitionGraph,
  buildCompetitionGraphContext,
  buildCompetitionGraphEdges,
} from "./competition/competition-graph-context";
export { traverseCompetitionGraph } from "./competition/competition-graph-traversal";
export {
  analyzeTenderCompetition,
  analyzeCanonicalTenderCompetition,
  compareBrandsInTender,
  calculateWinPressure,
  findDominantCompetitor,
  simulateWinScenario,
} from "./competition/competition-analysis";
export {
  buildCompetitionRankings,
  findDominantCompetitorInGraph,
} from "./competition/competition-ranking";
export {
  validateCompetitionGraph,
  validateTenderIntelligenceNetworkPhase2,
  getTenderKnowledgeGraphPhase2FreezeMeta,
} from "./competition/competition-validation";
export * from "./optimization/optimization-types";
export { buildTenderStrategyContext } from "./optimization/strategy-context";
export { buildTenderOptimizationGaps } from "./optimization/optimization-gap";
export {
  buildStrategyScoreBreakdown,
  estimateWinProbabilityDeltaFromGap,
  buildStrategyCandidatesForTender,
} from "./optimization/strategy-builder";
export {
  buildTenderStrategyRecommendations,
  findTopTenderStrategyRecommendation,
} from "./optimization/optimization-recommendation";
export { rankTenderStrategies } from "./optimization/strategy-ranking";
export {
  calculateWinProbabilityDelta,
  simulateTenderStrategy,
} from "./optimization/strategy-simulation";
export {
  validateTenderOptimization,
  validateTenderIntelligenceNetworkPhase3,
  getTenderKnowledgeGraphPhase3FreezeMeta,
} from "./optimization/optimization-validation";
