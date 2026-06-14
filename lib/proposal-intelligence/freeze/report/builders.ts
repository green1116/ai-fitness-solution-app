import { buildBidStrategyReport } from "../../report/builders";
import type { ProposalIntelligenceFreezeReport } from "../../shared/types";
import {
  CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
  PROPOSAL_INTELLIGENCE_TAG,
  PROPOSAL_INTELLIGENCE_VERSION,
} from "../../shared/types";
import { buildProposalIntelligenceCoverageStats } from "../coverage";
import {
  PROPOSAL_INTELLIGENCE_FROZEN_DOMAINS,
  PROPOSAL_INTELLIGENCE_RISK_CATEGORIES,
  PROPOSAL_INTELLIGENCE_SCORING_DIMENSIONS,
  PROPOSAL_INTELLIGENCE_STRATEGY_TYPES,
  PROPOSAL_INTELLIGENCE_VALIDATION_GATES,
} from "../constants";
import { validateProposalIntelligenceFreeze } from "../validators";

export function buildProposalIntelligenceFreezeReport(): ProposalIntelligenceFreezeReport {
  const coverage = buildProposalIntelligenceCoverageStats();
  const validation = validateProposalIntelligenceFreeze();
  const exampleStrategyReport = validation.valid
    ? buildBidStrategyReport(CANONICAL_PROPOSAL_INTELLIGENCE_QUERY)
    : null;

  const readinessScore = Math.round(
    (coverage.coverageScore + validation.validationScore) / 2,
  );

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    coverageScore: coverage.coverageScore,
    proposalScore: exampleStrategyReport?.proposalScore ?? 0,
    winProbability: exampleStrategyReport?.winProbability ?? 0,
    strategyType: exampleStrategyReport?.strategy.strategyType ?? "high-confidence",
  };

  return {
    version: PROPOSAL_INTELLIGENCE_VERSION,
    tag: PROPOSAL_INTELLIGENCE_TAG,
    reportId: `proposal-intelligence-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    exampleStrategyReport,
    moduleStatistics: {
      frozenDomains: PROPOSAL_INTELLIGENCE_FROZEN_DOMAINS.length,
      scoringDimensions: PROPOSAL_INTELLIGENCE_SCORING_DIMENSIONS.length,
      riskCategories: PROPOSAL_INTELLIGENCE_RISK_CATEGORIES.length,
      strategyTypes: PROPOSAL_INTELLIGENCE_STRATEGY_TYPES.length,
      validationGates: PROPOSAL_INTELLIGENCE_VALIDATION_GATES,
      reportBuilders: 4,
    },
    canonicalQuery: CANONICAL_PROPOSAL_INTELLIGENCE_QUERY,
    summary: [
      "proposal-intelligence-freeze-report",
      `tag=${PROPOSAL_INTELLIGENCE_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `coverageScore=${coverage.coverageScore}`,
      exampleStrategyReport
        ? `proposalScore=${exampleStrategyReport.proposalScore} winProbability=${exampleStrategyReport.winProbability} strategy=${exampleStrategyReport.strategy.strategyType}`
        : "example=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
