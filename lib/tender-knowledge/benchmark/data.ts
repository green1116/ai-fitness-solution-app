import type { BenchmarkProfile } from "../shared/types";

export const BENCHMARK_CATALOG: BenchmarkProfile[] = [
  {
    benchmarkId: "bench-sh-commercial-gym",
    industry: "commercial-gym",
    city: "Shanghai",
    avgWinProbability: 80,
    avgProposalScore: 84,
    avgMarginPercent: 16,
    sampleSize: 1,
    mode: "tender-knowledge",
  },
  {
    benchmarkId: "bench-bj-hotel",
    industry: "hotel",
    city: "Beijing",
    avgWinProbability: 68,
    avgProposalScore: 78,
    avgMarginPercent: 12,
    sampleSize: 1,
    mode: "tender-knowledge",
  },
  {
    benchmarkId: "bench-cd-community",
    industry: "community",
    city: "Chengdu",
    avgWinProbability: 79,
    avgProposalScore: 82,
    avgMarginPercent: 14,
    sampleSize: 1,
    mode: "tender-knowledge",
  },
  {
    benchmarkId: "bench-gz-campus",
    industry: "campus",
    city: "Guangzhou",
    avgWinProbability: 74,
    avgProposalScore: 80,
    avgMarginPercent: 13,
    sampleSize: 1,
    mode: "tender-knowledge",
  },
  {
    benchmarkId: "bench-sh-enterprise",
    industry: "enterprise",
    city: "Shanghai",
    avgWinProbability: 76,
    avgProposalScore: 83,
    avgMarginPercent: 16,
    sampleSize: 1,
    mode: "tender-knowledge",
  },
];

export function getAllBenchmarkProfiles(): BenchmarkProfile[] {
  return [...BENCHMARK_CATALOG];
}

export function getBenchmarkProfileById(benchmarkId: string): BenchmarkProfile | undefined {
  return BENCHMARK_CATALOG.find((b) => b.benchmarkId === benchmarkId);
}

export function getBenchmarkProfilesByIndustry(
  industry: BenchmarkProfile["industry"],
): BenchmarkProfile[] {
  return BENCHMARK_CATALOG.filter((b) => b.industry === industry);
}

export function getBenchmarkProfilesByCity(city: string): BenchmarkProfile[] {
  return BENCHMARK_CATALOG.filter((b) => b.city === city);
}
