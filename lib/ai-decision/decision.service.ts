/**
 * V62 P1 — AI Decision Engine public API
 */

export {
  analyzeBusinessState,
  detectGrowthBottlenecks,
  detectRevenueLeaks,
  generateStrategyPlan,
  optimizePricingStrategy,
  optimizeGrowthFunnels,
  optimizeSalesPipeline,
  generateActionPlan,
  runBusinessDecision,
  buildBusinessContext,
  generateRecommendations,
} from "./core/decision-engine";

export { runDecisionPipeline } from "./core/decision.pipeline";
export { executeDecisionAction, executeActionPlan, getDelegationTarget } from "./actions/action.executor";
export { rankRecommendations } from "./actions/recommendation.engine";
export { resetActionCounterForTests } from "./actions/action.generator";

export type {
  BusinessContext,
  DecisionOutput,
  DecisionAction,
  DecisionActionResult,
  DecisionPipelineResult,
  StrategyPlan,
  BusinessAnalysis,
} from "./core/decision.types";
