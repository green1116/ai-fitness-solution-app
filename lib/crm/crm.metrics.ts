/**
 * V60 P2 — CRM metrics aggregation
 */

import { crmDb, type CRMMetrics } from "./types";
import { sumDealRevenue } from "./deal/deal.value";

export async function aggregateCRMMetrics(organizationId: string): Promise<CRMMetrics> {
  const customers = await crmDb().customer.findMany({ where: { organizationId } });
  const customerIds = customers.map((c) => c.id);

  let totalLeads = 0;
  let qualifiedLeads = 0;
  let opportunities = 0;
  const allDeals: { amount: number; status: string }[] = [];

  for (const customerId of customerIds) {
    const leads = await crmDb().lead.findMany({ where: { customerId } });
    totalLeads += leads.length;
    qualifiedLeads += leads.filter((l) => l.status === "QUALIFIED").length;

    const opps = await crmDb().opportunity.findMany({ where: { customerId } });
    opportunities += opps.length;

    for (const opp of opps) {
      const deals = await crmDb().deal.findMany({ where: { opportunityId: opp.id } });
      allDeals.push(...deals);
    }
  }

  const dealsWon = allDeals.filter((d) => d.status === "CLOSED_WON").length;
  const revenue = sumDealRevenue(allDeals);

  return {
    totalCustomers: customers.length,
    totalLeads,
    qualifiedLeads,
    opportunities,
    dealsWon,
    revenue,
  };
}

export function createEmptyCRMMetrics(): CRMMetrics {
  return {
    totalCustomers: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    opportunities: 0,
    dealsWon: 0,
    revenue: 0,
  };
}
