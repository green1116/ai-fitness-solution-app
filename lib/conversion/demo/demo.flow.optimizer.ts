/**
 * V64 P2 — Demo flow optimizer
 */

import { aggregateConversionMetrics, computeDemoDropOffRate } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";

export type DemoFlowVariant = {
  id: string;
  flowStyle: "minimal" | "standard" | "guided";
  fieldCount: number;
  showUpsellAfter: boolean;
};

export function generateDemoVariants(): DemoFlowVariant[] {
  const dropOff = computeDemoDropOffRate();
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const simplify = dropOff > thresholds.demoDropOffHigh;

  if (simplify) {
    return [
      { id: "demo-minimal", flowStyle: "minimal", fieldCount: 1, showUpsellAfter: true },
      { id: "demo-standard", flowStyle: "standard", fieldCount: 2, showUpsellAfter: true },
      { id: "demo-guided", flowStyle: "guided", fieldCount: 3, showUpsellAfter: false },
    ];
  }

  return [
    { id: "demo-standard", flowStyle: "standard", fieldCount: 3, showUpsellAfter: true },
    { id: "demo-guided", flowStyle: "guided", fieldCount: 3, showUpsellAfter: true },
    { id: "demo-minimal", flowStyle: "minimal", fieldCount: 2, showUpsellAfter: true },
  ];
}

export function optimizeDemoFlow(): {
  variants: DemoFlowVariant[];
  actions: string[];
} {
  const dropOff = computeDemoDropOffRate();
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const variants = generateDemoVariants();
  const actions: string[] = [];

  if (dropOff > thresholds.demoDropOffHigh) {
    actions.push(`Demo drop-off ${dropOff}% — simplify to ${variants[0]?.flowStyle} flow`);
    actions.push(`Reduce form fields to ${variants[0]?.fieldCount}`);
  }
  if (metrics.demoComplete > 0 && metrics.signupRate < thresholds.conversionRateLow) {
    actions.push("Strengthen quote → signup CTA after demo result cards");
    actions.push("Add budget → upgrade trigger in demo upsell panel");
  }

  return { variants, actions };
}
