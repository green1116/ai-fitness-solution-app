/**
 * V61 P2 — Customer analytics (V60 P2 CRM via metrics layer)
 */

import { aggregateCRMMetrics, createEmptyCRMMetrics } from "@/lib/crm/crm.metrics";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";

export async function analyzeCustomers(organizationId: string) {
  let crm = createEmptyCRMMetrics();
  try {
    crm = await aggregateCRMMetrics(organizationId);
  } catch {
    crm = createEmptyCRMMetrics();
  }

  const growth = aggregateGrowthMetrics();
  const paidRatio =
    growth.signups > 0 ? Math.round((growth.paidUsers / growth.signups) * 100) : 0;

  return {
    crm,
    organizations: 1,
    totalCustomers: crm.totalCustomers,
    paidUserRatio: paidRatio,
    lifecycle: {
      leads: crm.totalLeads,
      qualified: crm.qualifiedLeads,
      opportunities: crm.opportunities,
      dealsWon: crm.dealsWon,
      revenue: crm.revenue,
    },
    growthOverlay: {
      signups: growth.signups,
      activated: growth.activatedUsers,
      paid: growth.paidUsers,
    },
  };
}

export function analyzeCustomersFromEvents() {
  const growth = aggregateGrowthMetrics();
  return {
    totalCustomers: growth.activatedUsers,
    organizations: new Set(
      growth.paidUsers > 0 ? ["active"] : [],
    ).size,
    paidUserRatio: growth.signups > 0 ? Math.round((growth.paidUsers / growth.signups) * 100) : 0,
    lifecycle: {
      signups: growth.signups,
      activated: growth.activatedUsers,
      paid: growth.paidUsers,
    },
  };
}
