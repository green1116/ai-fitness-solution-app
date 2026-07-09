/**
 * V87 — Revenue forecast control (read from V85/V86, derived values)
 */

import { getIntakeSession } from "@/lib/pilot/v80";

import type { RevenueForecastSummary, RevenueQueueItem } from "./revenue-ops.types";

/** Deterministic pilot contract value from session metadata (no schema) */
export function deriveExpectedRenewalValue(sessionId: string, fileSize?: number): number {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) >>> 0;
  }
  const base = 10_000 + (hash % 90_000);
  const sizeBoost = fileSize ? Math.min(Math.round(fileSize / 50), 10_000) : 0;
  return base + sizeBoost;
}

export function resolveExpectedRenewalValue(sessionId: string): number {
  const session = getIntakeSession(sessionId);
  return deriveExpectedRenewalValue(sessionId, session?.fileSize);
}

export function computeWeightedValue(
  expectedValue: number,
  renewalLikelihood: number,
): number {
  return Math.round(expectedValue * (renewalLikelihood / 100));
}

export function buildRevenueForecastSummary(
  items: RevenueQueueItem[],
  churnedRecords: Array<{ expectedRenewalValue: number }>,
): RevenueForecastSummary {
  const openItems = items.filter(
    (i) => i.outcome === "open" && i.revenueQueue !== "saved" && i.revenueQueue !== "renewed",
  );

  const expectedRenewalValue = openItems.reduce((sum, i) => sum + i.weightedValue, 0);

  const atRiskRevenue = items
    .filter(
      (i) =>
        i.outcome === "open" &&
        (i.revenueQueue === "at_risk" ||
          i.revenueQueue === "churn_risk" ||
          i.revenueQueue === "expiring_soon"),
    )
    .reduce((sum, i) => sum + i.expectedRenewalValue, 0);

  const savedRevenue = items
    .filter((i) => i.outcome === "saved" || i.revenueQueue === "saved")
    .reduce((sum, i) => sum + i.expectedRenewalValue, 0);

  const renewedRevenue = items
    .filter((i) => i.outcome === "renewed" || i.revenueQueue === "renewed")
    .reduce((sum, i) => sum + i.expectedRenewalValue, 0);

  const churnedRevenue = churnedRecords.reduce((sum, r) => sum + r.expectedRenewalValue, 0);

  return {
    expectedRenewalValue,
    atRiskRevenue,
    savedRevenue,
    renewedRevenue,
    churnedRevenue,
    readOnly: true,
  };
}
