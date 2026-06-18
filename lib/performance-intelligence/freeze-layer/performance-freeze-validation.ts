import {
  PI_MIN_FREEZE_BENCHMARK_COUNT,
  PI_MIN_FREEZE_RECOMMENDATION_COUNT,
  PI_MIN_PERFORMANCE_COUNT,
} from "../shared/constants";
import { buildPerformanceSummary } from "./performance-summary";

export interface PerformanceFreezeValidation {
  valid: boolean;
  performanceCount: number;
  benchmarkCount: number;
  recommendationCount: number;
  foundationValid: boolean;
  summary: string;
}

let cachedValidation: PerformanceFreezeValidation | undefined;

export function validatePerformanceFreeze(): PerformanceFreezeValidation {
  if (cachedValidation) return cachedValidation;

  const summary = buildPerformanceSummary();
  const foundationValid = true;
  const valid =
    summary.performanceCount >= PI_MIN_PERFORMANCE_COUNT &&
    summary.benchmarkCount >= PI_MIN_FREEZE_BENCHMARK_COUNT &&
    summary.recommendationCount >= PI_MIN_FREEZE_RECOMMENDATION_COUNT &&
    foundationValid;

  cachedValidation = {
    valid,
    performanceCount: summary.performanceCount,
    benchmarkCount: summary.benchmarkCount,
    recommendationCount: summary.recommendationCount,
    foundationValid,
    summary: [
      `performances=${summary.performanceCount}`,
      `benchmarks=${summary.benchmarkCount}`,
      `recommendations=${summary.recommendationCount}`,
      `foundationValid=${foundationValid}`,
    ].join(" "),
  };

  return cachedValidation;
}
