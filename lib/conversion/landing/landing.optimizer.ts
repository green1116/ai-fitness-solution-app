/**
 * V64 P2 — Landing page optimizer
 */

import { generateLandingVariants } from "./landing.variant.engine";
import { measureLandingPerformance } from "./landing.performance";
import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";
import { selectBestPerformingVariant } from "../ab-testing/ab.engine";

export function optimizeLandingPage(): {
  variants: ReturnType<typeof generateLandingVariants>;
  performance: ReturnType<typeof measureLandingPerformance>;
  recommendations: string[];
  deployedVariant?: ReturnType<typeof selectBestPerformingVariant>;
} {
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const variants = generateLandingVariants();
  const performance = measureLandingPerformance();
  const best = selectBestPerformingVariant("landing");
  const recommendations: string[] = [];

  if (metrics.signupRate < thresholds.conversionRateLow) {
    recommendations.push("A/B test hero headline: speed vs ROI framing");
    recommendations.push(`Reorder value props — lead with ${variants[0]?.valuePropOrder[0]}`);
  }
  if (performance.demoClickRate < thresholds.ctaClickRateLow) {
    recommendations.push("Move demo preview section above use cases");
    recommendations.push("Increase primary CTA contrast on hero");
  }
  recommendations.push("Test pricing layout variant on landing pricing section");
  if (best?.winner) {
    recommendations.push(`Deploy winning landing headline: ${best.payload.headline}`);
  }

  return {
    variants,
    performance,
    recommendations,
    deployedVariant: best ?? undefined,
  };
}
