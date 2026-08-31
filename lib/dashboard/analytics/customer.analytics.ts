/**
 * V61 P2 — Customer analytics (V60 P2 CRM via metrics layer)
 */

import { createEmptyCRMMetrics } from "@/lib/crm/crm.metrics";
import { sumDealRevenue } from "@/lib/crm/deal/deal.value";
import type {
  CRMActivityRow,
  CRMMetrics,
  CustomerRow,
  DealRow,
  LeadRow,
  OpportunityRow,
} from "@/lib/crm/types";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { prisma } from "@/lib/prisma";

const POST_WIN_PRODUCT_TYPES = new Set([
  "quote.generated",
  "budget.generated",
  "tender.generated",
]);

const ACTIVITY_LOOKBACK = 500;

type OrgCustomerAnalyticsSnapshot = {
  customers: CustomerRow[];
  leadsByCustomerId: Map<string, LeadRow[]>;
  opportunitiesByCustomerId: Map<string, OpportunityRow[]>;
  dealsByOpportunityId: Map<string, DealRow[]>;
  activitiesByCustomerId: Map<string, CRMActivityRow[]>;
};

function groupRowsByKey<T extends { [key: string]: unknown }>(
  rows: readonly T[],
  key: keyof T & string,
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const groupKey = String(row[key]);
    const bucket = grouped.get(groupKey);
    if (bucket) bucket.push(row);
    else grouped.set(groupKey, [row]);
  }
  return grouped;
}

function limitActivitiesPerCustomer(
  activities: readonly CRMActivityRow[],
  customerIds: readonly string[],
  limit: number,
): Map<string, CRMActivityRow[]> {
  const grouped = groupRowsByKey(activities, "customerId");
  const limited = new Map<string, CRMActivityRow[]>();
  for (const customerId of customerIds) {
    const rows = [...(grouped.get(customerId) ?? [])].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    limited.set(customerId, rows.slice(0, limit));
  }
  return limited;
}

async function loadOrgCustomerAnalyticsSnapshot(
  organizationId: string,
): Promise<OrgCustomerAnalyticsSnapshot> {
  const customers = await prisma.customer.findMany({ where: { organizationId } });
  const customerIds = customers.map((customer) => customer.id);

  if (customerIds.length === 0) {
    return {
      customers,
      leadsByCustomerId: new Map(),
      opportunitiesByCustomerId: new Map(),
      dealsByOpportunityId: new Map(),
      activitiesByCustomerId: new Map(),
    };
  }

  const [allLeads, allOpportunities, allActivities] = await Promise.all([
    prisma.crmLead.findMany({ where: { customerId: { in: customerIds } } }),
    prisma.opportunity.findMany({ where: { customerId: { in: customerIds } } }),
    prisma.cRMActivity.findMany({
      where: { customerId: { in: customerIds } },
      orderBy: { timestamp: "asc" },
    }),
  ]);

  const opportunityIds = allOpportunities.map((opp) => opp.id);
  const allDeals =
    opportunityIds.length === 0
      ? []
      : await prisma.deal.findMany({
          where: { opportunityId: { in: opportunityIds } },
        });

  return {
    customers,
    leadsByCustomerId: groupRowsByKey(allLeads, "customerId"),
    opportunitiesByCustomerId: groupRowsByKey(allOpportunities, "customerId"),
    dealsByOpportunityId: groupRowsByKey(allDeals, "opportunityId"),
    activitiesByCustomerId: limitActivitiesPerCustomer(
      allActivities,
      customerIds,
      ACTIVITY_LOOKBACK,
    ),
  };
}

function computeCrmMetricsFromSnapshot(snapshot: OrgCustomerAnalyticsSnapshot): CRMMetrics {
  const { customers, leadsByCustomerId, opportunitiesByCustomerId, dealsByOpportunityId } =
    snapshot;
  let totalLeads = 0;
  let qualifiedLeads = 0;
  let opportunities = 0;
  const allDeals: Pick<DealRow, "amount" | "status">[] = [];

  for (const customer of customers) {
    const leads = leadsByCustomerId.get(customer.id) ?? [];
    totalLeads += leads.length;
    qualifiedLeads += leads.filter((lead) => lead.status === "QUALIFIED").length;

    const opps = opportunitiesByCustomerId.get(customer.id) ?? [];
    opportunities += opps.length;

    for (const opp of opps) {
      const deals = dealsByOpportunityId.get(opp.id) ?? [];
      allDeals.push(...deals);
    }
  }

  return {
    totalCustomers: customers.length,
    totalLeads,
    qualifiedLeads,
    opportunities,
    dealsWon: allDeals.filter((deal) => deal.status === "CLOSED_WON").length,
    revenue: sumDealRevenue(allDeals),
  };
}

function computeWonRevenueFromSnapshot(snapshot: OrgCustomerAnalyticsSnapshot): {
  wonCustomerIds: string[];
  revenueByCustomer: Record<string, number>;
} {
  const revenueByCustomer: Record<string, number> = {};

  for (const customer of snapshot.customers) {
    const opps = snapshot.opportunitiesByCustomerId.get(customer.id) ?? [];
    let total = 0;
    let hasWon = false;
    for (const opp of opps) {
      const deals = snapshot.dealsByOpportunityId.get(opp.id) ?? [];
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

  return {
    wonCustomerIds: Object.keys(revenueByCustomer).sort(),
    revenueByCustomer,
  };
}

function earliestClosedWonAtFromSnapshot(
  customerId: string,
  snapshot: OrgCustomerAnalyticsSnapshot,
): number | null {
  const activities = snapshot.activitiesByCustomerId.get(customerId) ?? [];
  const winTs = activities
    .filter((activity) => activity.type === "deal.closed_won")
    .map((activity) => activity.timestamp.getTime());
  if (winTs.length > 0) return Math.min(...winTs);

  const opps = snapshot.opportunitiesByCustomerId.get(customerId) ?? [];
  const dealTimes: number[] = [];
  for (const opp of opps) {
    const deals = snapshot.dealsByOpportunityId.get(opp.id) ?? [];
    for (const deal of deals) {
      if (deal.status === "CLOSED_WON") {
        dealTimes.push(deal.updatedAt.getTime());
      }
    }
  }
  return dealTimes.length > 0 ? Math.min(...dealTimes) : null;
}

function computePostWinActivityFromSnapshot(
  snapshot: OrgCustomerAnalyticsSnapshot,
  wonCustomerIds: string[],
): Record<string, number> {
  const postWinActivityCountByCustomer: Record<string, number> = {};
  for (const customerId of wonCustomerIds) {
    const after = earliestClosedWonAtFromSnapshot(customerId, snapshot);
    if (after == null) {
      postWinActivityCountByCustomer[customerId] = 0;
      continue;
    }
    const activities = snapshot.activitiesByCustomerId.get(customerId) ?? [];
    postWinActivityCountByCustomer[customerId] = activities.filter(
      (activity) =>
        POST_WIN_PRODUCT_TYPES.has(activity.type) && activity.timestamp.getTime() > after,
    ).length;
  }
  return postWinActivityCountByCustomer;
}

function mergeCrmMetrics(parts: readonly CRMMetrics[]): CRMMetrics {
  return parts.reduce(
    (acc, part) => ({
      totalCustomers: acc.totalCustomers + part.totalCustomers,
      totalLeads: acc.totalLeads + part.totalLeads,
      qualifiedLeads: acc.qualifiedLeads + part.qualifiedLeads,
      opportunities: acc.opportunities + part.opportunities,
      dealsWon: acc.dealsWon + part.dealsWon,
      revenue: acc.revenue + part.revenue,
    }),
    createEmptyCRMMetrics(),
  );
}

async function listDistinctCrmOrganizationIds(): Promise<string[]> {
  const rows = await prisma.customer.findMany({
    select: { organizationId: true },
    distinct: ["organizationId"],
  });
  return rows.map((row) => row.organizationId).sort();
}

function buildCustomerAnalyticsView(input: {
  crm: CRMMetrics;
  organizations: number;
  wonCustomerIds: string[];
  revenueByCustomer: Record<string, number>;
  postWinActivityCountByCustomer: Record<string, number>;
}) {
  const growth = aggregateGrowthMetrics();
  const paidRatio =
    growth.signups > 0 ? Math.round((growth.paidUsers / growth.signups) * 100) : 0;

  return {
    crm: input.crm,
    organizations: input.organizations,
    totalCustomers: input.crm.totalCustomers,
    paidUserRatio: paidRatio,
    lifecycle: {
      leads: input.crm.totalLeads,
      qualified: input.crm.qualifiedLeads,
      opportunities: input.crm.opportunities,
      dealsWon: input.crm.dealsWon,
      revenue: input.crm.revenue,
    },
    wonCustomerIds: input.wonCustomerIds,
    revenueByCustomer: input.revenueByCustomer,
    postWinActivityCountByCustomer: input.postWinActivityCountByCustomer,
    growthOverlay: {
      signups: growth.signups,
      activated: growth.activatedUsers,
      paid: growth.paidUsers,
    },
  };
}

export async function analyzeCustomers(organizationId: string) {
  let crm = createEmptyCRMMetrics();
  let wonCustomerIds: string[] = [];
  let revenueByCustomer: Record<string, number> = {};
  let postWinActivityCountByCustomer: Record<string, number> = {};

  if (organizationId) {
    try {
      const snapshot = await loadOrgCustomerAnalyticsSnapshot(organizationId);
      crm = computeCrmMetricsFromSnapshot(snapshot);
      const won = computeWonRevenueFromSnapshot(snapshot);
      wonCustomerIds = won.wonCustomerIds;
      revenueByCustomer = won.revenueByCustomer;
      postWinActivityCountByCustomer = computePostWinActivityFromSnapshot(
        snapshot,
        wonCustomerIds,
      );
    } catch {
      crm = createEmptyCRMMetrics();
      wonCustomerIds = [];
      revenueByCustomer = {};
      postWinActivityCountByCustomer = {};
    }
  }

  return buildCustomerAnalyticsView({
    crm,
    organizations: organizationId ? 1 : 0,
    wonCustomerIds,
    revenueByCustomer,
    postWinActivityCountByCustomer,
  });
}

export async function analyzePlatformCustomers() {
  let crm = createEmptyCRMMetrics();
  let wonCustomerIds: string[] = [];
  let revenueByCustomer: Record<string, number> = {};
  let postWinActivityCountByCustomer: Record<string, number> = {};
  let organizations = 0;

  try {
    const organizationIds = await listDistinctCrmOrganizationIds();
    organizations = organizationIds.length;
    const crmParts: CRMMetrics[] = [];

    for (const organizationId of organizationIds) {
      const snapshot = await loadOrgCustomerAnalyticsSnapshot(organizationId);
      crmParts.push(computeCrmMetricsFromSnapshot(snapshot));
      const won = computeWonRevenueFromSnapshot(snapshot);
      for (const customerId of won.wonCustomerIds) {
        revenueByCustomer[customerId] = won.revenueByCustomer[customerId];
      }
      Object.assign(
        postWinActivityCountByCustomer,
        computePostWinActivityFromSnapshot(snapshot, won.wonCustomerIds),
      );
    }

    crm = mergeCrmMetrics(crmParts);
    wonCustomerIds = Object.keys(revenueByCustomer).sort();
  } catch {
    crm = createEmptyCRMMetrics();
    wonCustomerIds = [];
    revenueByCustomer = {};
    postWinActivityCountByCustomer = {};
    organizations = 0;
  }

  return buildCustomerAnalyticsView({
    crm,
    organizations,
    wonCustomerIds,
    revenueByCustomer,
    postWinActivityCountByCustomer,
  });
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
