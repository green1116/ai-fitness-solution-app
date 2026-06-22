/**
 * V64 P2 — CTA optimizer
 */

import { generateCTAVariants } from "./cta.variants";
import { generateCTACopy } from "./cta.generator";
import { computeCtaClickRate } from "../core/conversion.context";
import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";
import { selectBestPerformingVariant } from "../ab-testing/ab.engine";

export function optimizeCTAButtons(): {
  recommended: ReturnType<typeof generateCTACopy>;
  variants: ReturnType<typeof generateCTAVariants>;
  actions: string[];
} {
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const clickRate = computeCtaClickRate();
  const variants = generateCTAVariants();
  const recommended = generateCTACopy();
  const best = selectBestPerformingVariant("cta");
  const actions: string[] = [];

  if (clickRate < thresholds.ctaClickRateLow) {
    actions.push(`CTA click rate ${clickRate}% below threshold — rotate primary CTA`);
    actions.push(`Test variant: ${variants[0]?.label}`);
  }
  if (best && best.winner) {
    actions.push(`Deploy winning CTA: ${best.payload.cta}`);
  }
  actions.push(`Primary CTA recommendation: ${recommended.primary}`);

  return { recommended, variants, actions };
}
