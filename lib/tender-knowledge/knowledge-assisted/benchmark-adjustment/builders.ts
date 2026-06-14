import {
  getBenchmarkProfilesByCity,
  getBenchmarkProfilesByIndustry,
} from "../../benchmark";
import type { BenchmarkAdjustment, BenchmarkAdjustmentInput } from "../../shared/types";

function averageBenchmarkRate(profiles: { avgWinProbability: number }[]): number {
  if (profiles.length === 0) return 0;
  const sum = profiles.reduce((total, profile) => total + profile.avgWinProbability, 0);
  return Math.round(sum / profiles.length);
}

function resolveConfidenceAdjustment(sampleSize: number): number {
  if (sampleSize >= 5) return 0;
  if (sampleSize >= 3) return -1;
  if (sampleSize >= 1) return -2;
  return -5;
}

export function buildBenchmarkAdjustment(
  input: BenchmarkAdjustmentInput,
): BenchmarkAdjustment {
  const industryProfiles = getBenchmarkProfilesByIndustry(input.industry);
  const cityProfiles = getBenchmarkProfilesByCity(input.city);
  const industryBenchmark = industryProfiles[0] ?? null;
  const cityBenchmark = cityProfiles[0] ?? null;
  const industryBenchmarkRate = averageBenchmarkRate(industryProfiles);
  const cityBenchmarkRate = averageBenchmarkRate(cityProfiles);
  const combinedSampleSize =
    (industryBenchmark?.sampleSize ?? 0) + (cityBenchmark?.sampleSize ?? 0);

  const industryAdjustment = industryBenchmarkRate - input.baselineProbability;
  const cityAdjustment = cityBenchmarkRate - input.baselineProbability;
  const confidenceAdjustment = resolveConfidenceAdjustment(combinedSampleSize);

  return {
    industryAdjustment,
    cityAdjustment,
    confidenceAdjustment,
    industryBenchmarkRate,
    cityBenchmarkRate,
    industryBenchmark,
    cityBenchmark,
  };
}
