/**
 * V61 P2 — Churn metric (from V60 growth retention)
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { computeChurnRate } from "@/lib/growth/retention/churn.predictor";

export function computeChurnRateMetric(): number {
  const orgIds = [
    ...new Set(
      getGrowthEventsSnapshot()
        .map((e) => e.organizationId)
        .filter(Boolean) as string[],
    ),
  ];

  if (orgIds.length > 0) {
    return computeChurnRate(orgIds);
  }

  const growth = aggregateGrowthMetrics();
  return growth.churnRate;
}
