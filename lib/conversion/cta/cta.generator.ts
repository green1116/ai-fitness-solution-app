/**
 * V64 P2 — CTA copy generator
 */

import { generateCTAVariants } from "./cta.variants";
import { aggregateConversionMetrics } from "../core/conversion.context";

export function generateCTACopy(): {
  primary: string;
  secondary: string;
  tertiary?: string;
} {
  const variants = generateCTAVariants();
  const metrics = aggregateConversionMetrics();

  const primary = variants[0]?.label ?? "Start Free Demo";
  const secondary =
    metrics.signupRate < 10
      ? "Generate Your Quote"
      : (variants[1]?.label ?? "Try AI Now");

  return {
    primary,
    secondary,
    tertiary: variants[2]?.label,
  };
}
