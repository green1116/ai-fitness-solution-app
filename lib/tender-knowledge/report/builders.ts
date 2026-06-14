import { getAllHistoricalBidOutcomes } from "../bid-outcome";
import { getAllHistoricalProposals } from "../proposal-archive";
import { getAllHistoricalTenders } from "../project-archive";
import { buildKnowledgeAssistedWinProbability } from "../knowledge-assisted/win-probability/builders";
import { findSimilarHistoricalProjects } from "../knowledge-assisted/matching/builders";
import type {
  CityDistributionEntry,
  IndustryDistributionEntry,
  KnowledgeAssistedWinProbabilityReport,
  TenderKnowledgeReport,
} from "../shared/types";
import {
  CANONICAL_KNOWLEDGE_ASSISTED_QUERY,
  CANONICAL_TENDER_KNOWLEDGE_QUERY,
  TENDER_KNOWLEDGE_VERSION,
} from "../shared/types";
import {
  validateKnowledgeAssistedWinProbability,
  validateTenderKnowledge,
} from "../validation/validators";

function buildIndustryDistribution(): IndustryDistributionEntry[] {
  const counts = new Map<string, number>();
  for (const tender of getAllHistoricalTenders()) {
    counts.set(tender.industry, (counts.get(tender.industry) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([industry, count]) => ({
      industry: industry as IndustryDistributionEntry["industry"],
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildCityDistribution(): CityDistributionEntry[] {
  const counts = new Map<string, number>();
  for (const tender of getAllHistoricalTenders()) {
    counts.set(tender.city, (counts.get(tender.city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildTenderKnowledgeReport(): TenderKnowledgeReport {
  const projects = getAllHistoricalTenders();
  const proposals = getAllHistoricalProposals();
  const outcomes = getAllHistoricalBidOutcomes();
  const validation = validateTenderKnowledge();
  const winCount = outcomes.filter((o) => o.outcome === "won").length;
  const industryDistribution = buildIndustryDistribution();
  const cityDistribution = buildCityDistribution();

  return {
    version: TENDER_KNOWLEDGE_VERSION,
    reportId: `tender-knowledge-report-${Date.now()}`,
    projectCount: projects.length,
    proposalCount: proposals.length,
    winCount,
    industryDistribution,
    cityDistribution,
    validation,
    summary: [
      "tender-knowledge-report",
      `projects=${projects.length}`,
      `proposals=${proposals.length}`,
      `wins=${winCount}`,
      `industries=${industryDistribution.length}`,
      `cities=${cityDistribution.length}`,
      `valid=${validation.valid}`,
      `canonical=${CANONICAL_TENDER_KNOWLEDGE_QUERY.tenderId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

export function buildKnowledgeAssistedWinProbabilityReport(
  input = CANONICAL_KNOWLEDGE_ASSISTED_QUERY,
): KnowledgeAssistedWinProbabilityReport {
  const similarProjects = findSimilarHistoricalProjects(input);
  const winProbability = buildKnowledgeAssistedWinProbability(input, { similarProjects });
  const validation = validateKnowledgeAssistedWinProbability(winProbability);

  return {
    version: TENDER_KNOWLEDGE_VERSION,
    reportId: `knowledge-assisted-win-probability-report-${Date.now()}`,
    input,
    similarProjects,
    benchmarkDetails: winProbability.benchmarkDetails,
    winProbability,
    validation,
    summary: [
      "knowledge-assisted-win-probability-report",
      `baseline=${winProbability.baselineProbability}`,
      `historical=${winProbability.historicalWinRate}`,
      `calibrated=${winProbability.calibratedProbability}`,
      `confidence=${winProbability.confidence}`,
      `similarProjects=${similarProjects.length}`,
      `valid=${validation.valid}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
