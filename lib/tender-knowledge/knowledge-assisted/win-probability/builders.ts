import { buildBidWinProbabilityReport } from "@/lib/proposal-intelligence/report/builders";
import type { ProposalIntelligenceInput } from "@/lib/proposal-intelligence/shared/types";
import { buildBenchmarkAdjustment } from "../benchmark-adjustment/builders";
import { findSimilarHistoricalProjects } from "../matching/builders";
import type {
  BenchmarkAdjustment,
  KnowledgeAssistedWinProbability,
  KnowledgeAssistedWinProbabilityInput,
  SimilarHistoricalProject,
} from "../../shared/types";

const BASELINE_BLEND_WEIGHT = 0.5;
const HISTORICAL_BLEND_WEIGHT = 0.25;
const BENCHMARK_BLEND_WEIGHT = 0.25;

function computeHistoricalWinRate(
  similarProjects: SimilarHistoricalProject[],
  industryBenchmarkRate: number,
): number {
  if (similarProjects.length === 0) return industryBenchmarkRate;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const match of similarProjects) {
    const weight = match.matchScore / 5;
    let rate = match.proposal.winProbability;

    if (match.outcome?.outcome === "lost") {
      rate = Math.round(rate * 0.85);
    } else if (match.outcome?.outcome === "won") {
      rate = Math.round(rate * 0.92);
    }

    weightedSum += rate * weight;
    totalWeight += weight;
  }

  const proposalHistorical =
    totalWeight > 0 ? weightedSum / totalWeight : industryBenchmarkRate;

  return Math.round(proposalHistorical * 0.55 + industryBenchmarkRate * 0.35);
}

function resolveConfidence(
  similarProjects: SimilarHistoricalProject[],
  benchmark: BenchmarkAdjustment,
): KnowledgeAssistedWinProbability["confidence"] {
  const bestMatchScore = similarProjects[0]?.matchScore ?? 0;
  const combinedSampleSize =
    (benchmark.industryBenchmark?.sampleSize ?? 0) + (benchmark.cityBenchmark?.sampleSize ?? 0);

  if (bestMatchScore >= 4 && combinedSampleSize >= 2) return "high";
  if (bestMatchScore >= 3 && combinedSampleSize >= 1) return "medium";
  return "low";
}

function toProposalIntelligenceInput(
  input: KnowledgeAssistedWinProbabilityInput,
): ProposalIntelligenceInput {
  return {
    sku: input.sku,
    city: input.city,
    quantity: input.quantity,
    projectType: input.projectType,
  };
}

export function buildKnowledgeAssistedWinProbability(
  input: KnowledgeAssistedWinProbabilityInput,
  options?: {
    baselineProbability?: number;
    similarProjects?: SimilarHistoricalProject[];
    benchmarkAdjustment?: BenchmarkAdjustment;
  },
): KnowledgeAssistedWinProbability {
  const similarProjects =
    options?.similarProjects ?? findSimilarHistoricalProjects(input);
  const baselineProbability =
    options?.baselineProbability ??
    buildBidWinProbabilityReport(toProposalIntelligenceInput(input)).winProbability;
  const benchmarkDetails =
    options?.benchmarkAdjustment ??
    buildBenchmarkAdjustment({
      baselineProbability,
      industry: input.projectType,
      city: input.city,
    });

  const historicalWinRate = computeHistoricalWinRate(
    similarProjects,
    benchmarkDetails.industryBenchmarkRate || baselineProbability,
  );
  const historicalAdjustment = historicalWinRate - baselineProbability;
  const benchmarkNetAdjustment = Math.round(
    (benchmarkDetails.industryAdjustment + benchmarkDetails.cityAdjustment) / 2,
  );

  const calibratedProbability = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baselineProbability * BASELINE_BLEND_WEIGHT +
          historicalWinRate * HISTORICAL_BLEND_WEIGHT +
          benchmarkDetails.industryBenchmarkRate * BENCHMARK_BLEND_WEIGHT,
      ),
    ),
  );

  return {
    baselineProbability,
    historicalWinRate,
    historicalAdjustment,
    benchmarkAdjustment: benchmarkNetAdjustment,
    benchmarkDetails,
    calibratedProbability,
    confidence: resolveConfidence(similarProjects, benchmarkDetails),
    similarProjects,
  };
}
