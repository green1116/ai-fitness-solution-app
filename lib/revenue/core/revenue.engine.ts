/**
 * V64 P3 — Revenue optimization engine
 */

import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { RevenueLoopResult } from "../revenue.types";
import {
  buildRevenuePipeline,
  advanceRevenuePipeline,
  pipelineNeedsUpsell,
  pipelineNeedsPricingAdjust,
  pipelineNeedsEnterpriseRecommend,
} from "./revenue.pipeline";
import { analyzeRevenueStructure } from "../segmentation/revenue.segmenter";
import { optimizePricingStrategy, optimizeSubscriptionPlan } from "../pricing/pricing.optimizer";
import { predictLTV } from "../ltv/ltv.predictor";
import { optimizeLTV } from "../ltv/ltv.optimizer";
import { increaseARPU } from "../arpu/arpu.optimizer";
import { triggerUpsellFlow } from "../upsell/upsell.engine";
import { triggerCrossSell } from "../upsell/cross.sell.engine";
import { segmentHighValueUsers } from "../segmentation/user.segment.engine";

export function runRevenueEngine(traceId?: string): RevenueLoopResult {
  const tid = traceId ?? createTraceId();
  let pipeline = buildRevenuePipeline();

  pipeline = advanceRevenuePipeline(pipeline, "analyze_structure");
  const structure = analyzeRevenueStructure();

  pipeline = advanceRevenuePipeline(pipeline, "optimize_pricing");
  const pricing = optimizePricingStrategy();
  const subscription = optimizeSubscriptionPlan();

  pipeline = advanceRevenuePipeline(pipeline, "segment_users");
  segmentHighValueUsers();

  const ltvOpt = optimizeLTV();
  const arpuOpt = increaseARPU();

  pipeline = advanceRevenuePipeline(pipeline, "trigger_upsell");
  const upsellTriggers = pipelineNeedsUpsell(pipeline) ? triggerUpsellFlow() : triggerUpsellFlow().slice(0, 2);
  const crossSellOffers = triggerCrossSell();

  if (pipelineNeedsEnterpriseRecommend(pipeline)) {
    crossSellOffers.push("recommendEnterprisePlan: enterprise usage detected");
  }

  pipeline = advanceRevenuePipeline(pipeline, "deploy_recommendations");

  const actions = [
    ...pricing.actions,
    ...subscription.actions,
    ...arpuOpt.actions,
    ...ltvOpt.tactics.filter((t) => t.startsWith("trigger") || t.startsWith("recommend")),
  ];

  const optimizations = [
    ...pricing.optimizations,
    `LTV prediction: ¥${predictLTV().predictedLtv}`,
    `ARPU upsell pressure: ${arpuOpt.upsellPressure}`,
    `High-value share: ${structure.highValueShare}%`,
    `Enterprise share: ${structure.enterpriseShare}%`,
    `Pipeline: ${pipeline.stagesCompleted.join(" → ")}`,
  ];

  if (pipelineNeedsPricingAdjust(pipeline)) {
    optimizations.push("adjustPricing: ARPU below dynamic threshold");
  }

  appendGrowthEvent({
    event: "revenue.loop_completed",
    meta: { traceId: tid, mrr: pipeline.metrics.mrr, layer: "v64-p3" },
  });

  return {
    traceId: tid,
    metrics: pipeline.metrics,
    thresholds: pipeline.thresholds,
    segments: structure.segments,
    pricingRecommendations: pricing.recommendations,
    upsellTriggers,
    crossSellOffers,
    actions,
    optimizations,
    generatedAt: new Date().toISOString(),
  };
}

export function autoImproveRevenueLoop(traceId?: string): RevenueLoopResult {
  const pipeline = buildRevenuePipeline();
  const result = runRevenueEngine(traceId);
  const improvements: string[] = [];

  if (pipeline.metrics.ltv < pipeline.thresholds.ltvLow) {
    improvements.push("triggerUpsellFlow: LTV below threshold");
    triggerUpsellFlow();
  }

  if (pipeline.metrics.arpu < pipeline.thresholds.arpuLow) {
    improvements.push("adjustPricing: dynamic price recommendations applied");
    optimizePricingStrategy();
    increaseARPU();
  }

  if (pipelineNeedsEnterpriseRecommend(pipeline)) {
    improvements.push("recommendEnterprisePlan: high tender/API usage");
  }

  appendGrowthEvent({
    event: "revenue.auto_improve",
    meta: { traceId: result.traceId, improvements, layer: "v64-p3" },
  });

  return {
    ...result,
    optimizations: [...result.optimizations, ...improvements],
  };
}
