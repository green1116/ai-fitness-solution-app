/**
 * V64 P2 — Demo conversion optimizer
 */

import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";
import { optimizeDemoFlow } from "./demo.flow.optimizer";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import { selectBestPerformingVariant } from "../ab-testing/ab.engine";

export function optimizeDemoConversion(): {
  flow: ReturnType<typeof optimizeDemoFlow>;
  upsellTriggers: string[];
  actions: string[];
} {
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const flow = optimizeDemoFlow();
  const best = selectBestPerformingVariant("demo");
  const pro = getPricingTier("PRO");
  const enterprise = getPricingTier("ENTERPRISE");

  const upsellTriggers: string[] = [];
  const actions = [...flow.actions];

  if (metrics.demoComplete > metrics.signupRate) {
    upsellTriggers.push("Show PRO unlock after Budget preview");
    upsellTriggers.push(`Highlight ${pro.headline} in post-demo panel`);
  }
  if (metrics.conversionRate < thresholds.conversionRateLow) {
    upsellTriggers.push(`Enterprise tender upsell: ${enterprise.headline}`);
  }
  upsellTriggers.push("Persist demo sessionId through signup redirect");

  if (best?.winner) {
    actions.push(`Deploy winning demo flow: ${best.payload.flow}`);
  }

  return { flow, upsellTriggers, actions };
}
