/**
 * V61 P2 — Customer analytics (V60 P2 CRM via metrics layer)
 */

import { aggregateCRMMetrics, createEmptyCRMMetrics } from "@/lib/crm/crm.metrics";
import { crmDb } from "@/lib/crm/types";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";

async function aggregateWonRevenueByCustomer(organizationId: string): Promise<{
  wonCustomerIds: string[];
  revenueByCustomer: Record<string, number>;
}> {
  const revenueByCustomer: Record<string, number> = {};
  if (!organizationId) {
    return { wonCustomerIds: [], revenueByCustomer };
  }

  const customers = await crmDb().customer.findMany({ where: { organizationId } });
  for (const customer of customers) {
    const opps = await crmDb().opportunity.findMany({ where: { customerId: customer.id } });
    let total = 0;
    let hasWon = false;
    for (const opp of opps) {
      const deals = await crmDb().deal.findMany({ where: { opportunityId: opp.id } });
      for (const deal of deals) {
        if (deal.status === "CLOSED_WON") {
          hasWon = true;
          total += deal.amount;
        }
      }
    }
    if (hasWon) {
      revenueByCustomer[customer.id] = total;
    }
  }

  const wonCustomerIds = Object.keys(revenueByCustomer).sort();
  return { wonCustomerIds, revenueByCustomer };
}

const POST_WIN_PRODUCT_TYPES = new Set([
  "quote.generated",
  "budget.generated",
  "tender.generated",
]);

async function earliestClosedWonAt(customerId: string): Promise<number | null> {
  const activities = await crmDb().cRMActivity.findMany({
    where: { customerId },
    orderBy: { timestamp: "asc" },
    take: 500,
  });
  const winTs = activities
    .filter((a) => a.type === "deal.closed_won")
    .map((a) => a.timestamp.getTime());
  if (winTs.length > 0) return Math.min(...winTs);

  const opps = await crmDb().opportunity.findMany({ where: { customerId } });
  const dealTimes: number[] = [];
  for (const opp of opps) {
    const deals = await crmDb().deal.findMany({ where: { opportunityId: opp.id } });
    for (const deal of deals) {
      if (deal.status === "CLOSED_WON") {
        dealTimes.push(deal.updatedAt.getTime());
      }
    }
  }
  return dealTimes.length > 0 ? Math.min(...dealTimes) : null;
}

async function aggregatePostWinActivityByCustomer(
  wonCustomerIds: string[],
): Promise<Record<string, number>> {
  const postWinActivityCountByCustomer: Record<string, number> = {};
  for (const customerId of wonCustomerIds) {
    const after = await earliestClosedWonAt(customerId);
    if (after == null) {
      postWinActivityCountByCustomer[customerId] = 0;
      continue;
    }
    const activities = await crmDb().cRMActivity.findMany({
      where: { customerId },
      orderBy: { timestamp: "asc" },
      take: 500,
    });
    postWinActivityCountByCustomer[customerId] = activities.filter(
      (a) =>
        POST_WIN_PRODUCT_TYPES.has(a.type) && a.timestamp.getTime() > after,
    ).length;
  }
  return postWinActivityCountByCustomer;
}

export async function analyzeCustomers(organizationId: string) {
  let crm = createEmptyCRMMetrics();
  let wonCustomerIds: string[] = [];
  let revenueByCustomer: Record<string, number> = {};
  let postWinActivityCountByCustomer: Record<string, number> = {};

  if (organizationId) {
    try {
      crm = await aggregateCRMMetrics(organizationId);
      const won = await aggregateWonRevenueByCustomer(organizationId);
      wonCustomerIds = won.wonCustomerIds;
      revenueByCustomer = won.revenueByCustomer;
      postWinActivityCountByCustomer =
        await aggregatePostWinActivityByCustomer(wonCustomerIds);
    } catch {
      crm = createEmptyCRMMetrics();
      wonCustomerIds = [];
      revenueByCustomer = {};
      postWinActivityCountByCustomer = {};
    }
  }

  const growth = aggregateGrowthMetrics();
  const paidRatio =
    growth.signups > 0 ? Math.round((growth.paidUsers / growth.signups) * 100) : 0;

  return {
    crm,
    organizations: organizationId ? 1 : 0,
    totalCustomers: crm.totalCustomers,
    paidUserRatio: paidRatio,
    lifecycle: {
      leads: crm.totalLeads,
      qualified: crm.qualifiedLeads,
      opportunities: crm.opportunities,
      dealsWon: crm.dealsWon,
      revenue: crm.revenue,
    },
    wonCustomerIds,
    revenueByCustomer,
    postWinActivityCountByCustomer,
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
