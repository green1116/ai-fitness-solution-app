import {
  PI_MIN_AVERAGE_PERFORMANCE_SCORE,
  PI_MIN_PERFORMANCE_COUNT,
} from "../shared/constants";
import type { PerformanceFoundationValidation } from "../shared/types";
import { buildPerformanceRegistry } from "./performance-registry";

let cachedValidation: PerformanceFoundationValidation | undefined;

export function validatePerformanceFoundation(): PerformanceFoundationValidation {
  if (cachedValidation) return cachedValidation;

  const registry = buildPerformanceRegistry();
  const valid =
    registry.count >= PI_MIN_PERFORMANCE_COUNT &&
    registry.averageScore >= PI_MIN_AVERAGE_PERFORMANCE_SCORE;

  cachedValidation = {
    valid,
    performanceCount: registry.count,
    averageScore: registry.averageScore,
    summary: `performance-foundation count=${registry.count} averageScore=${registry.averageScore} valid=${valid}`,
  };

  return cachedValidation;
}
