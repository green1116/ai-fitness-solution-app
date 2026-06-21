/**
 * V61 P2 — Revenue analytics (V60 billing/growth events — no Stripe DB)
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { computeMRR } from "../metrics/mrr.metric";
import { computeARR } from "../metrics/arr.metric";

export type RevenueAnalytics = {
  mrr: number;
  arr: number;
  stripeRevenue: number;
  subscriptionBreakdown: { plan: string; count: number; mrr: number }[];
  usageRevenue: number;
  enterpriseRevenue: number;
  totalRevenue: number;
};

export function analyzeRevenue(): RevenueAnalytics {
  const events = getGrowthEventsSnapshot().filter((e) => e.event === "payment.completed");
  const planCounts = { BASIC: 0, PRO: 0, ENTERPRISE: 0 };

  let stripeRevenue = 0;
  for (const e of events) {
    const plan = String((e.meta as { plan?: string })?.plan ?? "PRO").toUpperCase();
    const amount = Number((e.meta as { amount?: number })?.amount ?? 0);
    stripeRevenue += amount;
    if (plan in planCounts) planCounts[plan as keyof typeof planCounts] += 1;
  }

  const mrr = computeMRR();
  const subscriptionBreakdown = (["BASIC", "PRO", "ENTERPRISE"] as const).map((plan) => ({
    plan,
    count: planCounts[plan],
    mrr: planCounts[plan] * ({ BASIC: 29, PRO: 99, ENTERPRISE: 299 }[plan]),
  }));

  const usageRevenue = Math.round(mrr * 0.15);
  const enterpriseRevenue = planCounts.ENTERPRISE * 299;

  return {
    mrr,
    arr: computeARR(mrr),
    stripeRevenue,
    subscriptionBreakdown,
    usageRevenue,
    enterpriseRevenue,
    totalRevenue: stripeRevenue + usageRevenue,
  };
}

export function analyzeRevenueForOrganization(_organizationId: string): RevenueAnalytics {
  return analyzeRevenue();
}
