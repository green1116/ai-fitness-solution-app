/**
 * V65 — Business router (routes operations across universe instances)
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { getSaaSInstancesSnapshot } from "@/lib/universe/universe.store";
import { autoImproveRevenueLoop } from "@/lib/revenue/revenue.service";
import { autoImproveConversionLoop } from "@/lib/conversion/conversion.service";
import { runGrowthMarketingCycle } from "@/lib/growth-marketing/growth-marketing.service";

export type BusinessRouteTarget = "growth" | "conversion" | "revenue" | "instance";

export function routeBusinessOperation(target: BusinessRouteTarget, traceId?: string): {
  target: BusinessRouteTarget;
  result: unknown;
} {
  switch (target) {
    case "growth":
      return { target, result: runGrowthMarketingCycle(traceId) };
    case "conversion":
      return { target, result: autoImproveConversionLoop(traceId) };
    case "revenue":
      return { target, result: autoImproveRevenueLoop(traceId) };
    case "instance":
      return { target, result: getSaaSInstancesSnapshot() };
    default:
      return { target, result: null };
  }
}

export function resolveInstanceForIndustry(industry: VerticalIndustry): string | null {
  const inst = getSaaSInstancesSnapshot().find((i) => i.industry === industry);
  return inst?.id ?? null;
}

export function routeOptimizeForInstance(instanceId: string, traceId?: string): string[] {
  const actions: string[] = [];
  actions.push(`Route growth optimization for ${instanceId}`);
  routeBusinessOperation("growth", traceId);
  routeBusinessOperation("conversion", `${traceId}-cro`);
  routeBusinessOperation("revenue", `${traceId}-rev`);
  return actions;
}
