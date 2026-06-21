/**
 * V64 P2 — Conversion optimization engine
 */

import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { ConversionLoopResult } from "../conversion.types";
import { computeConversionThresholds } from "../conversion.types";
import { aggregateConversionMetrics } from "./conversion.context";
import { buildConversionPipeline, advancePipeline, pipelineNeedsVariantGeneration } from "./conversion.pipeline";
import { analyzeFunnelPerformance } from "../funnel/funnel.analyzer";
import { optimizeConversionFunnel } from "../funnel/funnel.optimizer";
import { generateABVariants, selectBestPerformingVariant, testConversionRates } from "../ab-testing/ab.engine";
import { optimizeLandingPage } from "../landing/landing.optimizer";
import { optimizeDemoFlow } from "../demo/demo.flow.optimizer";
import { optimizeCTAButtons } from "../cta/cta.optimizer";
import { optimizeDemoConversion } from "../demo/demo.conversion.optimizer";

export function runConversionEngine(traceId?: string): ConversionLoopResult {
  const tid = traceId ?? createTraceId();
  let pipeline = buildConversionPipeline();
  const funnel = analyzeFunnelPerformance();

  pipeline = advancePipeline(pipeline, "analyze_funnel");

  const landing = optimizeLandingPage();
  const demo = optimizeDemoConversion();
  const cta = optimizeCTAButtons();
  const funnelOpts = optimizeConversionFunnel();

  if (pipelineNeedsVariantGeneration(pipeline)) {
    pipeline = advancePipeline(pipeline, "generate_variants");
    testConversionRates("cta");
    testConversionRates("landing");
  }

  pipeline = advancePipeline(pipeline, "test_rates");
  pipeline = advancePipeline(pipeline, "select_winner");
  pipeline = advancePipeline(pipeline, "deploy_optimizations");

  const bestVariants = (["landing", "cta", "demo", "pricing"] as const)
    .map((t) => selectBestPerformingVariant(t))
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const actions = [
    ...landing.recommendations,
    ...demo.actions,
    ...cta.actions,
    ...funnelOpts,
  ];

  const optimizations = [
    `Weakest funnel step: ${funnel.weakestStep}`,
    `CTA click rate target met: ${pipeline.ctaClickRate >= pipeline.thresholds.ctaClickRateLow}`,
    `Demo drop-off: ${pipeline.demoDropOffRate}%`,
    `Pipeline stages: ${pipeline.stagesCompleted.join(" → ")}`,
  ];

  appendGrowthEvent({
    event: "cro.loop_completed",
    meta: { traceId: tid, layer: "v64-p2" },
  });

  return {
    traceId: tid,
    metrics: pipeline.metrics,
    thresholds: pipeline.thresholds,
    bestVariants,
    optimizations,
    actions,
    funnelSteps: funnel.steps,
    generatedAt: new Date().toISOString(),
  };
}

export function autoImproveConversionLoop(traceId?: string): ConversionLoopResult {
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const result = runConversionEngine(traceId);

  const improvements: string[] = [];

  if (metrics.conversionRate < thresholds.conversionRateLow) {
    improvements.push("generateNewVariant: landing + CTA experiments");
    generateABVariants(["landing", "cta"]);
  }

  const cta = optimizeCTAButtons();
  if (cta.actions.some((a) => a.includes("below threshold"))) {
    improvements.push("optimizeCTA: rotate primary button copy");
  }

  const demoFlow = optimizeDemoFlow();
  if (demoFlow.actions.some((a) => a.includes("simplify"))) {
    improvements.push("simplifyDemoFlow: reduce demo form fields");
  }

  appendGrowthEvent({
    event: "cro.auto_improve",
    meta: {
      traceId: result.traceId,
      improvements,
      layer: "v64-p2",
    },
  });

  return {
    ...result,
    optimizations: [...result.optimizations, ...improvements],
  };
}
