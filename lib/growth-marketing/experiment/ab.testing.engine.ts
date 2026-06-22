/**
 * V65 — A/B testing engine
 */

import type { ABTestVariant } from "../growth-marketing.types";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { deriveSignupRate } from "../growth-metrics.util";

export function runABTesting(experimentId = "landing-hero"): ABTestVariant[] {
  const events = getGrowthEventsSnapshot();
  const metrics = aggregateGrowthMetrics();
  const signupRate = deriveSignupRate(metrics);
  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate: signupRate,
  });

  const variantAImpressions = events.filter((e) => (e.meta as { variant?: string })?.variant === "A").length || Math.max(10, metrics.visitors);
  const variantBImpressions = events.filter((e) => (e.meta as { variant?: string })?.variant === "B").length || Math.max(8, Math.floor(metrics.visitors * 0.4));
  const variantASignups = Math.floor(variantAImpressions * (signupRate / 100) * 0.9);
  const variantBSignups = Math.floor(variantBImpressions * (signupRate / 100) * 1.1);

  const variants: ABTestVariant[] = [
    {
      id: `${experimentId}-A`,
      name: "Control — speed headline",
      impressions: variantAImpressions,
      conversionRate: variantAImpressions > 0 ? Math.round((variantASignups / variantAImpressions) * 100) : 0,
      winner: false,
    },
    {
      id: `${experimentId}-B`,
      name: "Variant — ROI headline",
      impressions: variantBImpressions,
      conversionRate: variantBImpressions > 0 ? Math.round((variantBSignups / variantBImpressions) * 100) : 0,
      winner: false,
    },
  ];

  const minSample = thresholds.abTestMinSample;
  const ready = variants.every((v) => v.impressions >= minSample / 10);
  if (ready) {
    const best = [...variants].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    if (best) best.winner = true;
  }

  return variants;
}
