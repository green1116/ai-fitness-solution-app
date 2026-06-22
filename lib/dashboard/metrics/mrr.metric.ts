/**
 * V61 P2 — MRR metric (from V60 growth/billing events — no direct Stripe DB)
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";

const PLAN_MRR_USD: Record<string, number> = {
  BASIC: 29,
  PRO: 99,
  ENTERPRISE: 299,
};

export function computeMRR(): number {
  const events = getGrowthEventsSnapshot().filter((e) => e.event === "payment.completed");
  if (events.length === 0) return 0;

  let mrr = 0;
  const seenOrgs = new Set<string>();

  for (const event of events) {
    const orgId = event.organizationId;
    if (!orgId || seenOrgs.has(orgId)) continue;
    seenOrgs.add(orgId);

    const plan = String((event.meta as { plan?: string })?.plan ?? "PRO").toUpperCase();
    const amount = (event.meta as { amount?: number })?.amount;
    mrr += amount && amount > 0 ? Math.round(amount / 12) || amount : (PLAN_MRR_USD[plan] ?? 99);
  }

  return mrr;
}

export function computeMRRFromPlanCounts(counts: { BASIC: number; PRO: number; ENTERPRISE: number }): number {
  return (
    counts.BASIC * PLAN_MRR_USD.BASIC +
    counts.PRO * PLAN_MRR_USD.PRO +
    counts.ENTERPRISE * PLAN_MRR_USD.ENTERPRISE
  );
}
