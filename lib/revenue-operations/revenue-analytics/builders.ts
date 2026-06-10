import { buildCustomerProfiles } from "../customer/builders";
import type { RevenueSnapshot, RevenueTrendPoint } from "./types";

export function buildRevenueSnapshot(input?: { deploymentId?: string }): RevenueSnapshot {
  const deploymentId = input?.deploymentId ?? "analytics-default";
  const customers = buildCustomerProfiles({ deploymentId });
  const paying = customers.filter((c) => c.tier !== "trial");
  const mrrCny = paying.reduce((s, c) => s + c.mrrCny, 0);

  return {
    mrrCny,
    arrCny: mrrCny * 12,
    revenueGrowthPercent: 12.5,
    arpcCny: paying.length > 0 ? Math.round(mrrCny / paying.length) : 0,
    customerCount: paying.length,
    asOf: new Date().toISOString(),
  };
}

export function buildRevenueTrend(input?: { deploymentId?: string }): RevenueTrendPoint[] {
  const snapshot = buildRevenueSnapshot(input);
  const base = snapshot.mrrCny;
  return [
    { period: "2025-Q4", mrrCny: Math.round(base * 0.85) },
    { period: "2026-Q1", mrrCny: Math.round(base * 0.92) },
    { period: "2026-Q2", mrrCny: base },
  ];
}
