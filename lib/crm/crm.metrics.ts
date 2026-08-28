/**
 * V60 P2 — CRM metrics aggregation
 */

import { crmDb, type CRMMetrics } from "./types";
import { sumDealRevenue } from "./deal/deal.value";

const TERMINAL_OPPORTUNITY_STAGES = new Set(["WON", "LOST"]);
const ENTERPRISE_CONSULT_SOURCE = "enterprise_consultation";
const OPEN_PIPELINE_STAGE_ORDER = ["INIT", "PROPOSAL", "NEGOTIATION"] as const;

export type OpenPipelineStageMetric = Readonly<{
  stage: string;
  count: number;
  totalValue: number;
}>;

export type ConsultFunnelMetric = Readonly<{
  consult: number;
  opportunity: number;
  won: number;
}>;

export type RevenueIntelligenceSnapshot = Readonly<{
  openPipelineByStage: readonly OpenPipelineStageMetric[];
  openPipeline: Readonly<{ count: number; totalValue: number }>;
  consultFunnel: ConsultFunnelMetric;
}>;

export async function aggregateCRMMetrics(organizationId: string): Promise<CRMMetrics> {
  const customers = await crmDb().customer.findMany({ where: { organizationId } });
  const customerIds = customers.map((c) => c.id);

  let totalLeads = 0;
  let qualifiedLeads = 0;
  let opportunities = 0;
  const allDeals: { amount: number; status: string }[] = [];

  for (const customerId of customerIds) {
    const leads = await crmDb().crmLead.findMany({ where: { customerId } });
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

export function buildRevenueIntelligenceSnapshot(input: {
  stageTotals: ReadonlyMap<string, { count: number; totalValue: number }>;
  consultLeadIds: ReadonlySet<string>;
  consultOpportunityIds: ReadonlySet<string>;
  consultWonOpportunityIds: ReadonlySet<string>;
}): RevenueIntelligenceSnapshot {
  const orderedStages = [
    ...OPEN_PIPELINE_STAGE_ORDER.filter((stage) => input.stageTotals.has(stage)),
    ...[...input.stageTotals.keys()]
      .filter((stage) => !(OPEN_PIPELINE_STAGE_ORDER as readonly string[]).includes(stage))
      .sort(),
  ];

  const openPipelineByStage: OpenPipelineStageMetric[] = orderedStages.map((stage) => {
    const bucket = input.stageTotals.get(stage) ?? { count: 0, totalValue: 0 };
    return {
      stage,
      count: bucket.count,
      totalValue: bucket.totalValue,
    };
  });

  return {
    openPipelineByStage,
    openPipeline: {
      count: openPipelineByStage.reduce((sum, row) => sum + row.count, 0),
      totalValue: openPipelineByStage.reduce((sum, row) => sum + row.totalValue, 0),
    },
    consultFunnel: {
      consult: input.consultLeadIds.size,
      opportunity: input.consultOpportunityIds.size,
      won: input.consultWonOpportunityIds.size,
    },
  };
}

/**
 * Read-only Revenue Intelligence Snapshot v1.
 * Org-scoped; open pipeline uses Opportunity.value only (never Deal.amount).
 * Consult funnel uses CrmLead.source=enterprise_consultation only (no marketing Lead).
 */
export async function aggregateRevenueIntelligenceSnapshot(
  organizationId: string,
): Promise<RevenueIntelligenceSnapshot> {
  const customers = await crmDb().customer.findMany({ where: { organizationId } });
  const stageTotals = new Map<string, { count: number; totalValue: number }>();
  const consultLeadIds = new Set<string>();
  const consultOpportunityIds = new Set<string>();
  const consultWonOpportunityIds = new Set<string>();

  for (const customer of customers) {
    const leads = await crmDb().crmLead.findMany({ where: { customerId: customer.id } });
    for (const lead of leads) {
      if (lead.source === ENTERPRISE_CONSULT_SOURCE) {
        consultLeadIds.add(lead.id);
      }
    }
  }

  for (const customer of customers) {
    const opportunities = await crmDb().opportunity.findMany({
      where: { customerId: customer.id },
    });

    for (const opp of opportunities) {
      if (!TERMINAL_OPPORTUNITY_STAGES.has(opp.stage)) {
        const bucket = stageTotals.get(opp.stage) ?? { count: 0, totalValue: 0 };
        bucket.count += 1;
        bucket.totalValue += opp.value;
        stageTotals.set(opp.stage, bucket);
      }

      if (!opp.leadId || !consultLeadIds.has(opp.leadId)) continue;
      consultOpportunityIds.add(opp.id);

      const deals = await crmDb().deal.findMany({ where: { opportunityId: opp.id } });
      if (deals.some((deal) => deal.status === "CLOSED_WON")) {
        consultWonOpportunityIds.add(opp.id);
      }
    }
  }

  return buildRevenueIntelligenceSnapshot({
    stageTotals,
    consultLeadIds,
    consultOpportunityIds,
    consultWonOpportunityIds,
  });
}

export function createEmptyRevenueIntelligenceSnapshot(): RevenueIntelligenceSnapshot {
  return {
    openPipelineByStage: [],
    openPipeline: { count: 0, totalValue: 0 },
    consultFunnel: { consult: 0, opportunity: 0, won: 0 },
  };
}
