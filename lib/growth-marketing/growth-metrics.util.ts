/**
 * V65 — Growth metrics helpers
 */

import type { GrowthMetrics } from "@/lib/growth/funnel/growth.funnel.model";

export function deriveSignupRate(metrics: GrowthMetrics): number {
  return metrics.visitors > 0 ? Math.round((metrics.signups / metrics.visitors) * 100) : 0;
}

export function derivePaidConversionRate(metrics: GrowthMetrics): number {
  return metrics.visitors > 0 ? Math.round((metrics.paidUsers / metrics.visitors) * 100) : 0;
}

export function deriveActivationRate(metrics: GrowthMetrics): number {
  return metrics.signups > 0 ? Math.round((metrics.activatedUsers / metrics.signups) * 100) : 0;
}
