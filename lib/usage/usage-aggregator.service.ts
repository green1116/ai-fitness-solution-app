/**
 * V59 SaaS — Usage aggregation
 */

import { saasDb, type UsageType } from "@/lib/saas/types";

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export async function getUsageCountInPeriod(
  organizationId: string,
  type: UsageType,
  since?: Date,
): Promise<number> {
  const from = since ?? new Date(Date.now() - PERIOD_MS);

  const result = await saasDb().usageRecord.aggregate({
    where: {
      organizationId,
      type,
      createdAt: { gte: from },
    },
    _sum: { count: true },
  });

  return result._sum.count ?? 0;
}

export type UsageSummary = {
  organizationId: string;
  periodStart: string;
  totals: Record<UsageType, number>;
};

export async function getUsageSummary(organizationId: string): Promise<UsageSummary> {
  const from = new Date(Date.now() - PERIOD_MS);
  const types: UsageType[] = ["QUOTE", "BUDGET", "TENDER", "PDF"];

  const counts = await Promise.all(
    types.map((type) => getUsageCountInPeriod(organizationId, type, from)),
  );

  const totals = {} as Record<UsageType, number>;
  types.forEach((type, index) => {
    totals[type] = counts[index] ?? 0;
  });

  return {
    organizationId,
    periodStart: from.toISOString(),
    totals,
  };
}
