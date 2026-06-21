/**
 * V64 P2 — Conversion optimization pipeline
 */

import type { ConversionMetrics, ConversionThresholds } from "../conversion.types";
import { aggregateConversionMetrics, computeCtaClickRate, computeDemoDropOffRate } from "./conversion.context";
import { computeConversionThresholds } from "../conversion.types";

export type ConversionPipelineStage =
  | "collect_metrics"
  | "analyze_funnel"
  | "generate_variants"
  | "test_rates"
  | "select_winner"
  | "deploy_optimizations";

export type ConversionPipelineContext = {
  metrics: ConversionMetrics;
  thresholds: ConversionThresholds;
  ctaClickRate: number;
  demoDropOffRate: number;
  stagesCompleted: ConversionPipelineStage[];
};

export function buildConversionPipeline(): ConversionPipelineContext {
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  return {
    metrics,
    thresholds,
    ctaClickRate: computeCtaClickRate(),
    demoDropOffRate: computeDemoDropOffRate(),
    stagesCompleted: ["collect_metrics"],
  };
}

export function advancePipeline(
  ctx: ConversionPipelineContext,
  stage: ConversionPipelineStage,
): ConversionPipelineContext {
  if (ctx.stagesCompleted.includes(stage)) return ctx;
  return {
    ...ctx,
    stagesCompleted: [...ctx.stagesCompleted, stage],
  };
}

export function pipelineNeedsVariantGeneration(ctx: ConversionPipelineContext): boolean {
  return (
    ctx.metrics.conversionRate < ctx.thresholds.conversionRateLow ||
    ctx.ctaClickRate < ctx.thresholds.ctaClickRateLow ||
    ctx.demoDropOffRate > ctx.thresholds.demoDropOffHigh
  );
}
