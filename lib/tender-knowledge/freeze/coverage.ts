import { getAllBenchmarkProfiles } from "../benchmark";
import { getAllHistoricalBidOutcomes } from "../bid-outcome";
import { buildBenchmarkAdjustment } from "../knowledge-assisted/benchmark-adjustment/builders";
import { findSimilarHistoricalProjects } from "../knowledge-assisted/matching/builders";
import { buildKnowledgeAssistedWinProbability } from "../knowledge-assisted/win-probability/builders";
import { getAllHistoricalProposals } from "../proposal-archive";
import { getAllHistoricalTenders } from "../project-archive";
import { buildKnowledgeAssistedWinProbabilityReport } from "../report/builders";
import type { TenderKnowledgeCoverageStats } from "../shared/types";
import { CANONICAL_KNOWLEDGE_ASSISTED_QUERY } from "../shared/types";
import { TENDER_KNOWLEDGE_MATCHING_DIMENSIONS } from "./constants";

export function buildTenderKnowledgeCoverageStats(): TenderKnowledgeCoverageStats {
  const tenders = getAllHistoricalTenders();
  const projectArchiveChecks = [
    tenders.length >= 3,
    tenders.every((t) => t.tenderId.length > 0 && t.city.length > 0),
    tenders.every((t) => t.budgetMin > 0 && t.budgetMax >= t.budgetMin),
    tenders.every((t) => t.mode === "tender-knowledge"),
  ];
  const projectArchiveCoverage = Math.round(
    (projectArchiveChecks.filter(Boolean).length / projectArchiveChecks.length) * 100,
  );

  const proposals = getAllHistoricalProposals();
  const tenderIds = new Set(tenders.map((t) => t.tenderId));
  const proposalArchiveChecks = [
    proposals.length >= 3,
    proposals.every((p) => tenderIds.has(p.tenderId)),
    proposals.every((p) => p.sku.length > 0 && p.quantity > 0),
    proposals.every((p) => p.proposalScore > 0 && p.winProbability >= 0),
  ];
  const proposalArchiveCoverage = Math.round(
    (proposalArchiveChecks.filter(Boolean).length / proposalArchiveChecks.length) * 100,
  );

  const outcomes = getAllHistoricalBidOutcomes();
  const proposalIds = new Set(proposals.map((p) => p.proposalId));
  const bidOutcomeChecks = [
    outcomes.length >= 3,
    outcomes.every((o) => tenderIds.has(o.tenderId)),
    outcomes.every((o) => proposalIds.has(o.proposalId)),
    outcomes.some((o) => o.outcome === "won"),
  ];
  const bidOutcomeCoverage = Math.round(
    (bidOutcomeChecks.filter(Boolean).length / bidOutcomeChecks.length) * 100,
  );

  const benchmarks = getAllBenchmarkProfiles();
  const benchmarkChecks = [
    benchmarks.length >= 3,
    benchmarks.every((b) => b.sampleSize > 0),
    benchmarks.every((b) => b.avgWinProbability > 0 && b.avgProposalScore > 0),
    benchmarks.every((b) => b.mode === "tender-knowledge"),
  ];
  const benchmarkCoverage = Math.round(
    (benchmarkChecks.filter(Boolean).length / benchmarkChecks.length) * 100,
  );

  const input = CANONICAL_KNOWLEDGE_ASSISTED_QUERY;
  const knowledgeReport = buildKnowledgeAssistedWinProbabilityReport(input);
  const similarProjects = findSimilarHistoricalProjects(input);
  const winProbability = buildKnowledgeAssistedWinProbability(input);
  const benchmarkAdjustment = buildBenchmarkAdjustment({
    baselineProbability: winProbability.baselineProbability,
    industry: input.projectType,
    city: input.city,
  });
  const matchingDimensionsFound = TENDER_KNOWLEDGE_MATCHING_DIMENSIONS.filter((dimension) =>
    similarProjects.some((project) => project.matchedDimensions[dimension]),
  ).length;
  const knowledgeChecks = [
    similarProjects.length > 0,
    benchmarkAdjustment.industryBenchmark !== null || benchmarkAdjustment.cityBenchmark !== null,
    winProbability.calibratedProbability > 0,
    winProbability.baselineProbability > 0,
    knowledgeReport.validation.valid,
    matchingDimensionsFound === TENDER_KNOWLEDGE_MATCHING_DIMENSIONS.length,
  ];
  const knowledgeCoverage = Math.round(
    (knowledgeChecks.filter(Boolean).length / knowledgeChecks.length) * 100,
  );

  const coverageScore = Math.round(
    (projectArchiveCoverage +
      proposalArchiveCoverage +
      bidOutcomeCoverage +
      benchmarkCoverage +
      knowledgeCoverage) /
      5,
  );

  return {
    projectArchiveCoverage,
    proposalArchiveCoverage,
    bidOutcomeCoverage,
    benchmarkCoverage,
    knowledgeCoverage,
    coverageScore,
  };
}
