import {
  buildProposalRecommendations,
  formatRiskSummaries,
} from "../recommendation/builders";
import { buildRiskAnalysis } from "../risk-analysis/builders";
import { buildProposalScore } from "../scoring/builders";
import { buildCompetitivePositionAnalysis } from "../competitive-position/builders";
import { buildTenderContextProfile } from "../tender-context/builders";
import { buildWinProbabilityModel } from "../win-probability/builders";
import { buildBidStrategy } from "../strategy/builders";
import type {
  BidStrategyReport,
  BidWinProbabilityReport,
  ProposalIntelligenceInput,
  ProposalIntelligenceReport,
  ProposalIntelligenceSummaryReport,
} from "../shared/types";
import {
  CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
  PROPOSAL_INTELLIGENCE_VERSION,
} from "../shared/types";
import {
  validateProposalIntelligence,
  validateWinProbabilityAnalysis,
  validateBidStrategyAnalysis,
} from "../validation/validators";

export function buildProposalIntelligenceReport(
  input: ProposalIntelligenceInput = CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
): ProposalIntelligenceReport {
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);
  const recommendationOutput = buildProposalRecommendations(input);
  const validation = validateProposalIntelligence(input);

  const riskSummaries = formatRiskSummaries(risks);
  const readiness = validation.valid
    ? Math.round(
        (scoreBreakdown.score +
          (riskSummaries.length === 0 ? 100 : Math.max(0, 100 - riskSummaries.length * 15))) /
          2,
      )
    : 0;

  return {
    score: scoreBreakdown.score,
    strengths: recommendationOutput.strengths,
    weaknesses: recommendationOutput.weaknesses,
    risks: riskSummaries.length > 0 ? riskSummaries : ["No elevated risks identified"],
    recommendations: recommendationOutput.recommendations,
    readiness: Math.min(100, readiness),
  };
}

export function buildProposalIntelligenceSummaryReport(
  input: ProposalIntelligenceInput = CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
): ProposalIntelligenceSummaryReport {
  const scoreBreakdown = buildProposalScore(input);
  const riskAnalysis = buildRiskAnalysis(input);
  const intelligence = buildProposalIntelligenceReport(input);
  const validation = validateProposalIntelligence(input);

  return {
    version: PROPOSAL_INTELLIGENCE_VERSION,
    reportId: `proposal-intelligence-summary-${Date.now()}`,
    input,
    scoreBreakdown,
    riskAnalysis,
    intelligence,
    validation,
    summary: [
      "proposal-intelligence-summary",
      `score=${intelligence.score}`,
      `readiness=${intelligence.readiness}`,
      `valid=${validation.valid}`,
      `strengths=${intelligence.strengths.length}`,
      `risks=${intelligence.risks.length}`,
      `recommendations=${intelligence.recommendations.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

export function buildBidWinProbabilityReport(
  input: ProposalIntelligenceInput = CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
): BidWinProbabilityReport {
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);
  const intelligence = buildProposalIntelligenceReport(input);
  const tenderContext = buildTenderContextProfile(input);
  const competitivePosition = buildCompetitivePositionAnalysis(input);
  const winProbabilityModel = buildWinProbabilityModel({
    score: scoreBreakdown.score,
    risks,
    tenderContext,
  });
  const validation = validateWinProbabilityAnalysis(input);

  const keyRisks = [
    ...intelligence.weaknesses.map((w) => w.replace(/^./, (c) => c.toUpperCase())),
    ...formatRiskSummaries(risks),
  ].filter((value, index, array) => array.indexOf(value) === index);

  const recommendations = [
    ...intelligence.recommendations,
    ...competitivePosition.weaknesses.flatMap((weakness) => {
      if (weakness.toLowerCase().includes("supplier")) return ["Add backup supplier"];
      if (weakness.toLowerCase().includes("coverage")) return ["Expand regional coverage"];
      if (weakness.toLowerCase().includes("price")) return ["Apply bulk procurement rules"];
      if (weakness.toLowerCase().includes("delivery")) return ["Confirm expedited delivery plan"];
      return [`Address: ${weakness}`];
    }),
  ].filter((value, index, array) => array.indexOf(value) === index);

  return {
    version: PROPOSAL_INTELLIGENCE_VERSION,
    reportId: `bid-win-probability-report-${Date.now()}`,
    input,
    winProbability: winProbabilityModel.adjustedProbability,
    competitivePosition,
    keyReasons: winProbabilityModel.reasons,
    keyRisks,
    recommendations,
    tenderContext,
    winProbabilityModel,
    validation,
    summary: [
      "bid-win-probability-report",
      `winProbability=${winProbabilityModel.adjustedProbability}`,
      `confidence=${winProbabilityModel.confidence}`,
      `rank=${competitivePosition.competitiveRank}`,
      `valid=${validation.valid}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

function resolveExpectedMargin(strategyType: BidStrategyReport["strategy"]["strategyType"]): string {
  switch (strategyType) {
    case "high-confidence":
      return "Standard project margin — bulk pricing ~17% below list";
    case "balanced":
      return "Moderate margin — balanced discount with competitive positioning";
    case "aggressive":
      return "Reduced margin — additional 3–5% concession accepted";
    case "cost-optimized":
      return "Protected margin — minimal discount, profitability first";
  }
}

function resolveExpectedRisk(
  risks: ReturnType<typeof buildRiskAnalysis>,
  strategyType: BidStrategyReport["strategy"]["strategyType"],
): string {
  const elevatedCount = risks.filter((r) => r.level !== "low").length;
  if (strategyType === "high-confidence" && elevatedCount <= 1) {
    return "Low–medium — manageable concentration risk with backup plan";
  }
  if (strategyType === "balanced") {
    return "Medium — balanced exposure across pricing and supply chain";
  }
  if (strategyType === "aggressive") {
    return "Medium–high — margin sacrifice increases financial exposure";
  }
  return "Low financial risk — higher competitive loss probability";
}

function buildStrategyRationale(
  winReport: BidWinProbabilityReport,
  strategyType: BidStrategyReport["strategy"]["strategyType"],
): string[] {
  const rationale: string[] = [];

  if (strategyType === "high-confidence") {
    if (winReport.keyReasons.some((r) => r.toLowerCase().includes("inventory"))) {
      rationale.push("Strong inventory availability");
    }
    if (
      winReport.keyReasons.some(
        (r) => r.toLowerCase().includes("lead time") || r.toLowerCase().includes("delivery"),
      )
    ) {
      rationale.push("Fast delivery lead time");
    }
    if (
      winReport.keyReasons.some(
        (r) => r.toLowerCase().includes("coverage") || r.toLowerCase().includes("supplier"),
      )
    ) {
      rationale.push("High regional service coverage");
    }
    if (winReport.winProbability >= 80) {
      rationale.push("Win probability supports confident bid posture");
    }
    rationale.push("Elevated risks remain manageable with contingency planning");
  } else {
    rationale.push(...winReport.keyReasons.slice(0, 3));
  }

  return [...new Set(rationale)];
}

export function buildBidStrategyReport(
  input: ProposalIntelligenceInput = CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
): BidStrategyReport {
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);
  const winReport = buildBidWinProbabilityReport(input);
  const strategy = buildBidStrategy({
    proposalScore: scoreBreakdown.score,
    risks,
    winProbability: winReport.winProbability,
  });
  const validation = validateBidStrategyAnalysis(input);
  const rationale = buildStrategyRationale(winReport, strategy.strategyType);

  return {
    version: PROPOSAL_INTELLIGENCE_VERSION,
    reportId: `bid-strategy-report-${Date.now()}`,
    input,
    proposalScore: scoreBreakdown.score,
    winProbability: winReport.winProbability,
    strategy,
    expectedWinRate: strategy.expectedWinRate,
    expectedMargin: resolveExpectedMargin(strategy.strategyType),
    expectedRisk: resolveExpectedRisk(risks, strategy.strategyType),
    rationale,
    validation,
    summary: [
      "bid-strategy-report",
      `strategy=${strategy.strategyType}`,
      `expectedWinRate=${strategy.expectedWinRate}`,
      `proposalScore=${scoreBreakdown.score}`,
      `winProbability=${winReport.winProbability}`,
      `valid=${validation.valid}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
