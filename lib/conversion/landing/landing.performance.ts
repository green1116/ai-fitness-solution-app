/**
 * V64 P2 — Landing performance metrics
 */

import { aggregateConversionMetrics } from "../core/conversion.context";
import { analyzeFunnelPerformance } from "../funnel/funnel.analyzer";

export type PricingLayoutVariant = {
  id: string;
  layout: "cards" | "comparison" | "highlight-pro";
  highlightPlan: string;
};

export function measureLandingPerformance(): {
  landingView: number;
  demoClickRate: number;
  signupRate: number;
  weakestFunnelStep: string;
} {
  const metrics = aggregateConversionMetrics();
  const funnel = analyzeFunnelPerformance();
  const demoClickRate =
    metrics.landingView > 0
      ? Math.round((metrics.demoStart / metrics.landingView) * 100)
      : 0;

  return {
    landingView: metrics.landingView,
    demoClickRate,
    signupRate: metrics.signupRate,
    weakestFunnelStep: funnel.weakestStep,
  };
}

export function generatePricingVariants(): PricingLayoutVariant[] {
  const perf = measureLandingPerformance();
  const highlightPro = perf.signupRate < 15;

  return [
    { id: "pricing-cards", layout: "cards", highlightPlan: highlightPro ? "PRO" : "BASIC" },
    { id: "pricing-comparison", layout: "comparison", highlightPlan: "PRO" },
    { id: "pricing-highlight-pro", layout: "highlight-pro", highlightPlan: "ENTERPRISE" },
  ];
}
