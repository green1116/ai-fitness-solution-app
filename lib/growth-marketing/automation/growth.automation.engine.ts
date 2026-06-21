/**
 * V65 — Growth automation engine
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { optimizeLandingPages } from "../content/landing.copy.engine";
import { generateSEOContentBundle } from "../seo/seo.engine";
import { optimizeAdPerformance } from "../ads/ads.optimizer";
import { runFunnelExperiment } from "../experiment/funnel.experiment";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export function runGrowthAutomation(): {
  actions: string[];
  triggered: string[];
} {
  const metrics = aggregateGrowthMetrics();
  const conversionRate =
    metrics.visitors > 0 ? Math.round((metrics.paidUsers / metrics.visitors) * 100) : 0;
  const signupRate = metrics.visitors > 0 ? Math.round((metrics.signups / metrics.visitors) * 100) : 0;

  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate,
  });

  const actions: string[] = [];
  const triggered: string[] = [];

  if (conversionRate < thresholds.conversionRateLow) {
    triggered.push("optimize_landing");
    actions.push(...optimizeLandingPages().recommendations);
  }

  if (signupRate < thresholds.signupRateLow) {
    triggered.push("optimize_demo_flow");
    actions.push("Reduce demo form friction; surface signup after result preview");
    actions.push(...runFunnelExperiment().experiments.slice(0, 2));
  }

  const seo = generateSEOContentBundle();
  actions.push(`SEO: ${seo.content.title}`);

  const ads = optimizeAdPerformance();
  actions.push(...ads.actions.slice(0, 2));

  appendGrowthEvent({
    event: "growth.automation_run",
    meta: { triggered, actionCount: actions.length, layer: "v65" },
  });

  return { actions, triggered };
}
