/**
 * V65 — Growth loop (Traffic → Content → Exposure → V64 Demo → Feedback)
 */

import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import type { GrowthLoopResult } from "../growth-marketing.types";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { analyzeTrafficSources, analyzeTrafficQuality } from "../traffic/traffic.analyzer";
import { generateSEOContentBundle } from "../seo/seo.engine";
import { optimizeAdPerformance } from "../ads/ads.optimizer";
import { optimizeLandingPages } from "../content/landing.copy.engine";
import { runABTesting } from "../experiment/ab.testing.engine";
import { runFunnelExperiment } from "../experiment/funnel.experiment";
import { runGrowthAutomation } from "./growth.automation.engine";
import { selfOptimizeGrowthLoop } from "./self.optimization.engine";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export function runGrowthLoop(traceId?: string): GrowthLoopResult {
  const tid = traceId ?? createTraceId();
  const metrics = aggregateGrowthMetrics();
  const conversionRate =
    metrics.visitors > 0 ? Math.round((metrics.signups / Math.max(metrics.visitors, 1)) * 100) : 0;

  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate,
  });

  const traffic = analyzeTrafficSources();
  const quality = analyzeTrafficQuality();
  const seo = generateSEOContentBundle();
  const ads = optimizeAdPerformance();
  const landing = optimizeLandingPages();
  const funnel = runFunnelExperiment();
  const automation = runGrowthAutomation();
  const experiments = runABTesting();
  const selfOpt = selfOptimizeGrowthLoop();

  const actions = [
    ...automation.actions,
    ...ads.actions,
    ...landing.recommendations,
    ...funnel.experiments,
    ...selfOpt.improvements,
  ];

  appendGrowthEvent({
    event: "growth.loop_completed",
    meta: { traceId: tid, trafficSources: traffic.length, layer: "v65" },
  });

  return {
    traceId: tid,
    thresholds,
    actions,
    optimizations: [
      `Traffic quality: ${quality.overall}`,
      `SEO slug: ${seo.content.slug}`,
      `Weakest funnel stage: ${funnel.weakestStage}`,
    ],
    experiments,
    generatedAt: new Date().toISOString(),
  };
}
