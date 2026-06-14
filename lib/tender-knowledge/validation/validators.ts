import { getAllBenchmarkProfiles } from "../benchmark";
import { getAllHistoricalBidOutcomes } from "../bid-outcome";
import { getAllHistoricalProposals } from "../proposal-archive";
import { getAllHistoricalTenders } from "../project-archive";
import type {
  KnowledgeAssistedWinProbability,
  KnowledgeAssistedWinProbabilityValidation,
  TenderKnowledgeValidation,
} from "../shared/types";

function validateProjectArchive(): boolean {
  const tenders = getAllHistoricalTenders();
  if (tenders.length < 3) return false;
  return tenders.every(
    (t) =>
      t.tenderId.length > 0 &&
      t.projectName.length > 0 &&
      t.city.length > 0 &&
      t.budgetMin > 0 &&
      t.budgetMax >= t.budgetMin &&
      t.mode === "tender-knowledge",
  );
}

function validateProposalArchive(): boolean {
  const proposals = getAllHistoricalProposals();
  const tenderIds = new Set(getAllHistoricalTenders().map((t) => t.tenderId));
  if (proposals.length < 3) return false;
  return proposals.every(
    (p) =>
      p.proposalId.length > 0 &&
      tenderIds.has(p.tenderId) &&
      p.sku.length > 0 &&
      p.quantity > 0 &&
      p.finalPrice > 0 &&
      p.proposalScore > 0 &&
      p.winProbability >= 0 &&
      p.mode === "tender-knowledge",
  );
}

function validateBidOutcomeArchive(): boolean {
  const outcomes = getAllHistoricalBidOutcomes();
  const tenderIds = new Set(getAllHistoricalTenders().map((t) => t.tenderId));
  const proposalIds = new Set(getAllHistoricalProposals().map((p) => p.proposalId));
  if (outcomes.length < 3) return false;
  return outcomes.every(
    (o) =>
      o.outcomeId.length > 0 &&
      tenderIds.has(o.tenderId) &&
      proposalIds.has(o.proposalId) &&
      o.competitorCount >= 0 &&
      o.mode === "tender-knowledge",
  );
}

function validateBenchmarkCatalog(): boolean {
  const benchmarks = getAllBenchmarkProfiles();
  if (benchmarks.length < 3) return false;
  return benchmarks.every(
    (b) =>
      b.benchmarkId.length > 0 &&
      b.city.length > 0 &&
      b.sampleSize > 0 &&
      b.avgWinProbability >= 0 &&
      b.avgProposalScore > 0 &&
      b.mode === "tender-knowledge",
  );
}

export function validateTenderKnowledge(): TenderKnowledgeValidation {
  const projectArchiveValid = validateProjectArchive();
  const proposalArchiveValid = validateProposalArchive();
  const bidOutcomeValid = validateBidOutcomeArchive();
  const benchmarkValid = validateBenchmarkCatalog();

  return {
    valid:
      projectArchiveValid &&
      proposalArchiveValid &&
      bidOutcomeValid &&
      benchmarkValid,
    projectArchiveValid,
    proposalArchiveValid,
    bidOutcomeValid,
    benchmarkValid,
  };
}

export function validateKnowledgeAssistedWinProbability(
  result: KnowledgeAssistedWinProbability,
): KnowledgeAssistedWinProbabilityValidation {
  const historicalMatchExists = result.similarProjects.length > 0;
  const benchmarkExists =
    result.benchmarkDetails.industryBenchmark !== null ||
    result.benchmarkDetails.cityBenchmark !== null;
  const calibratedProbabilityExists =
    result.calibratedProbability > 0 && result.calibratedProbability <= 100;

  return {
    valid: historicalMatchExists && benchmarkExists && calibratedProbabilityExists,
    historicalMatchExists,
    benchmarkExists,
    calibratedProbabilityExists,
  };
}
