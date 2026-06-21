/**
 * V65 — Funnel experiment engine
 */

import { aggregateGrowthMetrics, buildFunnelSnapshot } from "@/lib/growth/funnel/funnel.analytics";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { describeFunnel } from "@/lib/landing/conversion/funnel.tracker";
import { deriveSignupRate } from "../growth-metrics.util";

export function runFunnelExperiment(): {
  funnel: ReturnType<typeof buildFunnelSnapshot>;
  weakestStage: string;
  experiments: string[];
} {
  const funnel = buildFunnelSnapshot();
  const metrics = aggregateGrowthMetrics();
  const signupRate = deriveSignupRate(metrics);
  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate: signupRate,
  });

  const stages = Object.entries(funnel).sort(([, a], [, b]) => a - b);
  const weakest = stages[0]?.[0] ?? "acquisition";

  const experiments: string[] = [];
  if (weakest === "acquisition") experiments.push("Test SEO + paid channel mix");
  if (weakest === "activation") experiments.push("Shorten demo form fields");
  if (weakest === "conversion") experiments.push("Add post-demo signup modal");
  if (signupRate < thresholds.conversionRateLow) {
    experiments.push("V64 demo upsell CTA placement test");
  }
  experiments.push(`Monitor funnel: ${describeFunnel()[0]}`);

  return { funnel, weakestStage: weakest, experiments };
}

export function optimizeConversionFunnels(): string[] {
  return runFunnelExperiment().experiments;
}
