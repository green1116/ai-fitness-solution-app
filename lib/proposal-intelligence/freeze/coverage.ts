import { buildBidStrategyReport } from "../report/builders";
import { buildBidWinProbabilityReport } from "../report/builders";
import { buildProposalRecommendations } from "../recommendation/builders";
import { buildRiskAnalysis } from "../risk-analysis/builders";
import { buildProposalScore } from "../scoring/builders";
import type { ProposalIntelligenceCoverageStats } from "../shared/types";
import { CANONICAL_PROPOSAL_INTELLIGENCE_QUERY } from "../shared/types";
import {
  PROPOSAL_INTELLIGENCE_RISK_CATEGORIES,
  PROPOSAL_INTELLIGENCE_SCORING_DIMENSIONS,
} from "./constants";

export function buildProposalIntelligenceCoverageStats(): ProposalIntelligenceCoverageStats {
  const input = CANONICAL_PROPOSAL_INTELLIGENCE_QUERY;

  const scoreBreakdown = buildProposalScore(input);
  const scoreChecks = PROPOSAL_INTELLIGENCE_SCORING_DIMENSIONS.map(
    (dim) => scoreBreakdown[dim] > 0,
  ).concat(scoreBreakdown.score > 0);
  const scoreCoverage = Math.round((scoreChecks.filter(Boolean).length / scoreChecks.length) * 100);

  const risks = buildRiskAnalysis(input);
  const riskCategoriesFound = PROPOSAL_INTELLIGENCE_RISK_CATEGORIES.filter((category) =>
    risks.some((r) => r.category === category),
  ).length;
  const riskCoverage = Math.round(
    (riskCategoriesFound / PROPOSAL_INTELLIGENCE_RISK_CATEGORIES.length) * 100,
  );

  const recommendations = buildProposalRecommendations(input);
  const recommendationChecks = [
    recommendations.strengths.length > 0,
    recommendations.weaknesses.length > 0,
    recommendations.recommendations.length > 0,
  ];
  const recommendationCoverage = Math.round(
    (recommendationChecks.filter(Boolean).length / recommendationChecks.length) * 100,
  );

  const winReport = buildBidWinProbabilityReport(input);
  const winProbabilityChecks = [
    winReport.winProbability > 0,
    winReport.winProbabilityModel.baseProbability > 0,
    winReport.winProbabilityModel.adjustedProbability > 0,
    winReport.winProbabilityModel.reasons.length > 0,
    winReport.competitivePosition.positionScore > 0,
  ];
  const winProbabilityCoverage = Math.round(
    (winProbabilityChecks.filter(Boolean).length / winProbabilityChecks.length) * 100,
  );

  const strategyReport = buildBidStrategyReport(input);
  const bidStrategyChecks = [
    strategyReport.strategy.strategyType.length > 0,
    strategyReport.expectedWinRate > 0,
    strategyReport.strategy.pricingAdjustment.length > 0,
    strategyReport.strategy.supplierAdjustment.length > 0,
    strategyReport.strategy.recommendations.length > 0,
  ];
  const bidStrategyCoverage = Math.round(
    (bidStrategyChecks.filter(Boolean).length / bidStrategyChecks.length) * 100,
  );

  const coverageScore = Math.round(
    (scoreCoverage +
      riskCoverage +
      recommendationCoverage +
      winProbabilityCoverage +
      bidStrategyCoverage) /
      5,
  );

  return {
    scoreCoverage,
    riskCoverage,
    recommendationCoverage,
    winProbabilityCoverage,
    bidStrategyCoverage,
    coverageScore,
  };
}
