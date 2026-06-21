/**
 * V65 — Self-optimization engine
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { analyzeTrafficQuality } from "../traffic/traffic.analyzer";
import { recommendTrafficSources } from "../traffic/traffic.source.engine";
import { optimizeAdsConversion } from "../ads/conversion.optimizer";
import { optimizeExperimentConversion } from "../experiment/conversion.optimizer";

export function selfOptimizeGrowthLoop(): {
  improvements: string[];
  nextCycleFocus: string;
} {
  const metrics = aggregateGrowthMetrics();
  const conversionRate =
    metrics.visitors > 0 ? Math.round((metrics.signups / metrics.visitors) * 100) : 0;
  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate,
  });

  const { overall } = analyzeTrafficQuality();
  const improvements: string[] = [];

  if (conversionRate < thresholds.conversionRateLow) {
    improvements.push(...optimizeLandingRecommendations());
    improvements.push(...optimizeAdsConversion());
  }

  if (overall === "low") {
    improvements.push(...recommendTrafficSources());
    improvements.push("Adjust SEO and ads per traffic quality feedback");
  }

  improvements.push(...optimizeExperimentConversion());

  const nextCycleFocus =
    conversionRate < thresholds.conversionRateLow
      ? "conversion"
      : overall === "low"
        ? "traffic_quality"
        : "scale";

  return { improvements, nextCycleFocus };
}

function optimizeLandingRecommendations(): string[] {
  return ["Self-opt: refresh landing hero copy from metrics", "Self-opt: prioritize demo CTA variant winner"];
}

export function optimizeLandingFromMetrics(): string[] {
  return optimizeLandingRecommendations();
}
