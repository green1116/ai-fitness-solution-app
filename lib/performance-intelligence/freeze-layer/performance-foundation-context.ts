import { PI_CANONICAL_ID, PI_FREEZE_TAG } from "../shared/constants";
import { buildBenchmarkContext } from "../benchmark-layer/benchmark-context";
import type { BenchmarkContext } from "../benchmark-layer/benchmark-types";
import { buildOptimizationContext } from "../optimization-layer/optimization-context";
import type { OptimizationContext } from "../optimization-layer/optimization-types";
import { buildPerformanceContext } from "../performance-foundation/performance-context";
import type { PerformanceContext } from "../shared/types";

export interface PerformanceFoundationContext {
  contextId: string;
  performance: PerformanceContext;
  benchmark: BenchmarkContext;
  opportunity: OptimizationContext["opportunities"];
  recommendation: OptimizationContext["recommendations"];
  optimization: OptimizationContext;
  freezeTag: typeof PI_FREEZE_TAG;
  foundationValid: boolean;
  mode: typeof PI_CANONICAL_ID;
}

let cachedContext: PerformanceFoundationContext | undefined;

export function buildPerformanceFoundationContext(): PerformanceFoundationContext {
  if (cachedContext) return cachedContext;

  const performance = buildPerformanceContext();
  const benchmark = buildBenchmarkContext();
  const optimization = buildOptimizationContext();

  cachedContext = {
    contextId: "pi-performance-foundation-context-v46-p4",
    performance,
    benchmark,
    opportunity: optimization.opportunities,
    recommendation: optimization.recommendations,
    optimization,
    freezeTag: PI_FREEZE_TAG,
    foundationValid: true,
    mode: PI_CANONICAL_ID,
  };

  return cachedContext;
}
