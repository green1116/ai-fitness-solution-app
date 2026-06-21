/**
 * V64 P2 — CTA variant templates (metrics-driven selection)
 */

import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeCtaClickRate } from "../core/conversion.context";

export type CTAVariant = {
  id: string;
  label: string;
  href: string;
  style: "primary" | "secondary";
};

const CTA_POOL: Omit<CTAVariant, "id">[] = [
  { label: "Start Free Demo", href: "/demo", style: "primary" },
  { label: "Generate Your Quote", href: "/quote-demo", style: "primary" },
  { label: "Try AI Now", href: "/demo", style: "secondary" },
  { label: "Build Your Tender", href: "/tender-demo", style: "secondary" },
];

export function generateCTAVariants(): CTAVariant[] {
  const metrics = aggregateConversionMetrics();
  const clickRate = computeCtaClickRate();

  const emphasizeDemo = clickRate < 12 || metrics.demoStart < metrics.landingView * 0.1;
  const ordered = emphasizeDemo
    ? [CTA_POOL[0], CTA_POOL[2], CTA_POOL[1], CTA_POOL[3]]
    : [CTA_POOL[1], CTA_POOL[0], CTA_POOL[3], CTA_POOL[2]];

  return ordered.map((v, i) => ({
    id: `cta-${i}-${v.label.toLowerCase().replace(/\s+/g, "-")}`,
    ...v,
  }));
}
