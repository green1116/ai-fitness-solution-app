/**
 * V64 P2 — Funnel performance analyzer
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import type { FunnelStepMetrics } from "../conversion.types";
import { CONVERSION_FUNNEL_STEPS, FUNNEL_STEP_EVENTS } from "./funnel.steps";
import { aggregateConversionMetrics } from "../core/conversion.context";

export function analyzeFunnelPerformance(): {
  steps: FunnelStepMetrics[];
  weakestStep: string;
  overallConversion: number;
} {
  const events = getGrowthEventsSnapshot();
  const counts: number[] = [];

  for (const step of CONVERSION_FUNNEL_STEPS) {
    const eventNames = FUNNEL_STEP_EVENTS[step];
    const count = events.filter((e) => eventNames.includes(e.event)).length;
    counts.push(count);
  }

  const steps: FunnelStepMetrics[] = CONVERSION_FUNNEL_STEPS.map((step, i) => {
    const count = counts[i] ?? 0;
    const prev = i > 0 ? (counts[i - 1] ?? 0) : count;
    const conversionFromPrevious = prev > 0 ? Math.round((count / prev) * 100) : count > 0 ? 100 : 0;
    const dropOffRate = prev > 0 ? Math.round(((prev - count) / prev) * 100) : 0;
    return { step, count, dropOffRate, conversionFromPrevious };
  });

  const weakest = [...steps]
    .filter((s) => s.dropOffRate > 0)
    .sort((a, b) => b.dropOffRate - a.dropOffRate)[0];

  const metrics = aggregateConversionMetrics();
  return {
    steps,
    weakestStep: weakest?.step ?? "landing_view",
    overallConversion: metrics.conversionRate,
  };
}
