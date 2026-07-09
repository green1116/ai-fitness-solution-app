/**
 * V80 POST-LAUNCH P2 — Revenue optimization builder (read-only P1 consumer)
 */
import { buildRevenueActivation } from "./revenue.builder";
import { V80_POSTLAUNCH_REVENUE_VERSION } from "./revenue.types";

import { CONVERSION_RATE_TUNING, isConversionRateTuningComplete } from "./optimization.conversion.spec";
import { ENTERPRISE_SALES_ACCELERATION, isEnterpriseSalesAccelerationComplete } from "./optimization.enterprise.spec";
import { isPricingYieldOptimizationComplete, PRICING_YIELD_OPTIMIZATION } from "./optimization.pricing-yield.spec";
import { isRevenueLeakDetectionComplete, REVENUE_LEAK_DETECTION } from "./optimization.leak-detection.spec";
import type { OptimizationManifest, RevenueOptimizationReport } from "./optimization.types";
import {
  V80_POSTLAUNCH_OPTIMIZATION_FREEZE_VERSION,
  V80_POSTLAUNCH_OPTIMIZATION_VERSION,
} from "./optimization.types";

export function buildOptimizationManifest(input: { revenueReady: boolean }): OptimizationManifest {
  const conversionComplete = isConversionRateTuningComplete();
  const enterpriseComplete = isEnterpriseSalesAccelerationComplete();
  const yieldComplete = isPricingYieldOptimizationComplete();
  const leakComplete = isRevenueLeakDetectionComplete();

  const optimizationComplete =
    input.revenueReady && conversionComplete && enterpriseComplete && yieldComplete && leakComplete;

  return {
    version: V80_POSTLAUNCH_OPTIMIZATION_VERSION,
    revenueVersion: V80_POSTLAUNCH_REVENUE_VERSION,
    conversionTunings: CONVERSION_RATE_TUNING.length,
    enterpriseAccelerations: ENTERPRISE_SALES_ACCELERATION.length,
    pricingYieldOpts: PRICING_YIELD_OPTIMIZATION.length,
    leakPoints: REVENUE_LEAK_DETECTION.length,
    optimizationComplete,
    summary: `optimization complete=${optimizationComplete} tunings=${CONVERSION_RATE_TUNING.length}`,
  };
}

export function buildRevenueOptimization(input?: { deploymentId?: string }): RevenueOptimizationReport {
  const deploymentId = input?.deploymentId ?? "v80-postlaunch-optimization";
  const revenueActivation = buildRevenueActivation({ deploymentId });
  const manifest = buildOptimizationManifest({ revenueReady: revenueActivation.revenueReady });

  const optimizationReady = revenueActivation.revenueReady && manifest.optimizationComplete;

  return {
    version: V80_POSTLAUNCH_OPTIMIZATION_VERSION,
    freezeVersion: V80_POSTLAUNCH_OPTIMIZATION_FREEZE_VERSION,
    reportId: `optimization-${deploymentId}`,
    revenueReady: revenueActivation.revenueReady,
    manifest,
    conversionTuning: CONVERSION_RATE_TUNING,
    enterpriseAcceleration: ENTERPRISE_SALES_ACCELERATION,
    pricingYield: PRICING_YIELD_OPTIMIZATION,
    leakDetection: REVENUE_LEAK_DETECTION,
    revenueActivation,
    optimizationReady,
    readinessScore: optimizationReady ? 100 : 0,
    summary: `optimization ready=${optimizationReady} revenue=${revenueActivation.revenueReady}`,
  };
}

export function assertRevenueOptimizationPass(
  report: RevenueOptimizationReport,
): asserts report is RevenueOptimizationReport & { optimizationReady: true } {
  if (!report.optimizationReady) {
    throw new Error(`V80 POST-LAUNCH optimization not ready: ${report.summary}`);
  }
}

export function formatOptimizationSummary(report: RevenueOptimizationReport): string {
  return [
    `V80 POST-LAUNCH P2 Revenue Optimization`,
    `  version: ${report.version}`,
    `  optimizationReady: ${report.optimizationReady}`,
    `  conversionTuning: ${report.conversionTuning.length} entry tunings`,
    `  enterpriseAcceleration: ${report.enterpriseAcceleration.length} cycle reductions`,
    `  pricingYield: ${report.pricingYield.length} yield optimizations`,
    `  leakDetection: ${report.leakDetection.length} leak fix points`,
    `  readinessScore: ${report.readinessScore}`,
  ].join("\n");
}

export function runRevenueOptimization(input?: { deploymentId?: string }) {
  return buildRevenueOptimization(input);
}
