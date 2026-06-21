/**
 * V64 P2 — Funnel optimizer
 */

import { analyzeFunnelPerformance } from "./funnel.analyzer";
import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";

export function optimizeConversionFunnel(): string[] {
  const analysis = analyzeFunnelPerformance();
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);
  const tactics: string[] = [];

  if (analysis.weakestStep === "landing_view" || analysis.weakestStep === "visitor") {
    tactics.push("Optimize hero headline via landing variant engine");
    tactics.push("Strengthen value proposition above fold");
  }
  if (analysis.weakestStep === "demo_click") {
    tactics.push("A/B test primary CTA copy and placement");
    tactics.push("Add inline demo preview on landing");
  }
  if (analysis.weakestStep === "demo_result") {
    tactics.push("Simplify demo input fields");
    tactics.push("Show Quote/Budget/Tender cards immediately after generate");
  }
  if (analysis.weakestStep === "signup") {
    tactics.push("Post-demo signup modal with session persistence");
  }
  if (metrics.conversionRate < thresholds.conversionRateLow) {
    tactics.push("Run pricing layout experiment on /pricing");
  }

  tactics.push(`Monitor weakest funnel step: ${analysis.weakestStep}`);
  return tactics;
}
