/**
 * V24 Proposal Intelligence Layer — proposal analysis on top of frozen V23 commercial pack.
 * Phase 1: scoring / risk analysis / recommendations.
 * Phase 2: bid win probability / competitive position / tender context.
 * Phase 3: bid strategy recommendations (high-confidence / balanced / aggressive / cost-optimized).
 * Freeze: proposal intelligence manifest, coverage, validation, evidence, reporting.
 * No Runtime. No Dashboard. No V20/V21/V22/V23/PDF Engine modifications.
 */

export * from "./shared/types";
export * from "./scoring";
export * from "./risk-analysis";
export * from "./recommendation";
export * from "./tender-context";
export * from "./competitive-position";
export * from "./win-probability";
export * from "./strategy";
export * from "./validation";
export * from "./report";
export * from "./freeze";
export { buildProposalScore } from "./scoring/builders";
export { buildRiskAnalysis } from "./risk-analysis/builders";
export { buildProposalRecommendations } from "./recommendation/builders";
export { buildTenderContextProfile } from "./tender-context/builders";
export { buildCompetitivePositionAnalysis } from "./competitive-position/builders";
export { buildWinProbabilityModel } from "./win-probability/builders";
export {
  buildBidStrategy,
  buildHighConfidenceBidStrategy,
  buildBalancedBidStrategy,
  buildAggressiveBidStrategy,
  buildCostOptimizedBidStrategy,
} from "./strategy/builders";
export {
  validateProposalIntelligence,
  validateWinProbabilityAnalysis,
  validateBidStrategy,
  validateBidStrategyAnalysis,
} from "./validation/validators";
export {
  buildProposalIntelligenceReport,
  buildProposalIntelligenceSummaryReport,
  buildBidWinProbabilityReport,
  buildBidStrategyReport,
} from "./report/builders";
