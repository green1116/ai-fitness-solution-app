/**
 * V64 P3 — Revenue optimization pipeline
 */

import type { RevenueMetrics, RevenueThresholds } from "../revenue.types";
import { aggregateRevenueMetrics, detectEnterpriseUsage } from "./revenue.context";
import { computeRevenueThresholds } from "../revenue.types";

export type RevenuePipelineStage =
  | "collect_metrics"
  | "analyze_structure"
  | "optimize_pricing"
  | "trigger_upsell"
  | "segment_users"
  | "deploy_recommendations";

export type RevenuePipelineContext = {
  metrics: RevenueMetrics;
  thresholds: RevenueThresholds;
  enterpriseUsageCount: number;
  stagesCompleted: RevenuePipelineStage[];
};

export function buildRevenuePipeline(): RevenuePipelineContext {
  const metrics = aggregateRevenueMetrics();
  return {
    metrics,
    thresholds: computeRevenueThresholds(metrics),
    enterpriseUsageCount: detectEnterpriseUsage(),
    stagesCompleted: ["collect_metrics"],
  };
}

export function advanceRevenuePipeline(
  ctx: RevenuePipelineContext,
  stage: RevenuePipelineStage,
): RevenuePipelineContext {
  if (ctx.stagesCompleted.includes(stage)) return ctx;
  return { ...ctx, stagesCompleted: [...ctx.stagesCompleted, stage] };
}

export function pipelineNeedsUpsell(ctx: RevenuePipelineContext): boolean {
  return (
    ctx.metrics.ltv < ctx.thresholds.ltvLow ||
    ctx.metrics.arpu < ctx.thresholds.arpuLow ||
    ctx.metrics.upgradeRate < ctx.thresholds.upgradeRateLow
  );
}

export function pipelineNeedsPricingAdjust(ctx: RevenuePipelineContext): boolean {
  return ctx.metrics.arpu < ctx.thresholds.arpuLow;
}

export function pipelineNeedsEnterpriseRecommend(ctx: RevenuePipelineContext): boolean {
  return ctx.enterpriseUsageCount >= ctx.thresholds.enterpriseUsageMin;
}
