import type {
  BidStrategy,
  BidStrategyInput,
  ProposalIntelligenceInput,
  ProposalIntelligenceValidation,
  BidStrategyValidation,
  WinProbabilityValidation,
} from "../shared/types";
import { buildBidStrategy } from "../strategy/builders";
import { buildCompetitivePositionAnalysis } from "../competitive-position/builders";
import { buildProposalRecommendations } from "../recommendation/builders";
import { buildRiskAnalysis } from "../risk-analysis/builders";
import { buildProposalScore } from "../scoring/builders";
import { buildTenderContextProfile } from "../tender-context/builders";
import { buildWinProbabilityModel } from "../win-probability/builders";

export function validateProposalIntelligence(
  input: ProposalIntelligenceInput,
): ProposalIntelligenceValidation {
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);
  const recommendations = buildProposalRecommendations(input);

  const scoreGenerated = scoreBreakdown.score > 0;
  const riskGenerated = risks.length > 0;
  const recommendationGenerated =
    recommendations.strengths.length > 0 ||
    recommendations.weaknesses.length > 0 ||
    recommendations.recommendations.length > 0;

  const valid = scoreGenerated && riskGenerated && recommendationGenerated;

  return {
    valid,
    scoreGenerated,
    riskGenerated,
    recommendationGenerated,
  };
}

export function validateWinProbabilityAnalysis(
  input: ProposalIntelligenceInput,
): WinProbabilityValidation {
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);
  const tenderContext = buildTenderContextProfile(input);
  const competitivePosition = buildCompetitivePositionAnalysis(input);
  const winModel = buildWinProbabilityModel({
    score: scoreBreakdown.score,
    risks,
    tenderContext,
  });

  const proposalScoreExists = scoreBreakdown.score > 0;
  const riskAnalysisExists = risks.length > 0;
  const tenderContextExists =
    tenderContext.tenderType.length > 0 && tenderContext.region.length > 0;
  const probabilityGenerated =
    winModel.baseProbability > 0 && winModel.adjustedProbability >= 0;
  const competitivePositionGenerated =
    competitivePosition.positionScore > 0 && competitivePosition.competitiveRank > 0;

  const valid =
    proposalScoreExists &&
    riskAnalysisExists &&
    tenderContextExists &&
    probabilityGenerated &&
    competitivePositionGenerated;

  return {
    valid,
    proposalScoreExists,
    riskAnalysisExists,
    tenderContextExists,
    probabilityGenerated,
    competitivePositionGenerated,
  };
}

export function validateBidStrategy(strategy: BidStrategy): BidStrategyValidation {
  const strategyGenerated = strategy.strategyType.length > 0;
  const expectedWinRateGenerated = strategy.expectedWinRate > 0;
  const adjustmentsGenerated =
    strategy.pricingAdjustment.length > 0 &&
    strategy.supplierAdjustment.length > 0 &&
    strategy.inventoryAdjustment.length > 0;
  const recommendationsGenerated = strategy.recommendations.length > 0;

  const valid =
    strategyGenerated &&
    expectedWinRateGenerated &&
    adjustmentsGenerated &&
    recommendationsGenerated;

  return {
    valid,
    strategyGenerated,
    expectedWinRateGenerated,
    adjustmentsGenerated,
    recommendationsGenerated,
  };
}

export function validateBidStrategyAnalysis(
  input: ProposalIntelligenceInput,
): BidStrategyValidation {
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);
  const tenderContext = buildTenderContextProfile(input);
  const winModel = buildWinProbabilityModel({
    score: scoreBreakdown.score,
    risks,
    tenderContext,
  });
  const strategy = buildBidStrategy({
    proposalScore: scoreBreakdown.score,
    risks,
    winProbability: winModel.adjustedProbability,
  });
  return validateBidStrategy(strategy);
}
