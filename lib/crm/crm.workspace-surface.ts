/**
 * CRM Workspace Surface — read-only assembler for operator visibility.
 * Org-scoped, deterministic, reuses existing CRM read services.
 */

import { listCustomers } from "./customer/customer.service";
import { listLeadsForCustomer } from "./lead/lead.service";
import { listOpportunitiesForCustomer } from "./opportunity/opportunity.service";
import { listDealsForOpportunity } from "./deal/deal.service";

export type CrmWorkItem = Readonly<{
  id: string;
  customerId: string;
  customerName: string;
  entity: "lead" | "opportunity" | "deal";
  entityId: string;
  status: string;
  score?: number;
  stage?: string;
  amount?: number;
  label: string;
}>;

export type CrmWorkSurface = Readonly<{
  items: readonly CrmWorkItem[];
  qualifiedLeads: number;
  activeOpportunities: number;
  openDeals: number;
}>;

const TERMINAL_OPPORTUNITY_STAGES = new Set(["WON", "LOST"]);

const ENTITY_PRIORITY = {
  deal: 0,
  opportunity: 1,
  lead: 2,
} as const;

const STAGE_PRIORITY: Record<string, number> = {
  NEGOTIATION: 0,
  PROPOSAL: 1,
  INIT: 2,
};

type SortableCrmWorkItem = CrmWorkItem & {
  createdAt: Date;
  rankValue: number;
};

function compareCrmWorkItems(a: SortableCrmWorkItem, b: SortableCrmWorkItem): number {
  const entityDiff = ENTITY_PRIORITY[a.entity] - ENTITY_PRIORITY[b.entity];
  if (entityDiff !== 0) return entityDiff;

  if (a.entity === "opportunity" && b.entity === "opportunity") {
    const stageDiff =
      (STAGE_PRIORITY[a.stage ?? ""] ?? Number.MAX_SAFE_INTEGER) -
      (STAGE_PRIORITY[b.stage ?? ""] ?? Number.MAX_SAFE_INTEGER);
    if (stageDiff !== 0) return stageDiff;
  }

  if (b.rankValue !== a.rankValue) return b.rankValue - a.rankValue;

  const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
  if (timeDiff !== 0) return timeDiff;

  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function toCrmWorkItem(item: SortableCrmWorkItem): CrmWorkItem {
  const { createdAt: _createdAt, rankValue: _rankValue, ...publicItem } = item;
  return publicItem;
}

export async function assembleCrmWorkSurface(
  organizationId: string,
): Promise<CrmWorkSurface> {
  const customers = await listCustomers(organizationId);
  const items: SortableCrmWorkItem[] = [];

  for (const customer of customers) {
    const opportunities = await listOpportunitiesForCustomer(customer.id);
    const promotedLeadIds = new Set(
      opportunities
        .map((opp) => opp.leadId)
        .filter((leadId): leadId is string => Boolean(leadId)),
    );

    const leads = await listLeadsForCustomer(customer.id);
    for (const lead of leads) {
      if (lead.status !== "QUALIFIED") continue;
      if (promotedLeadIds.has(lead.id)) continue;
      items.push({
        id: `crm:lead:${lead.id}`,
        customerId: customer.id,
        customerName: customer.name,
        entity: "lead",
        entityId: lead.id,
        status: lead.status,
        score: lead.score,
        label: `${customer.name} · Lead QUALIFIED · score ${lead.score} · ${lead.source}`,
        createdAt: lead.createdAt,
        rankValue: lead.score,
      });
    }

    for (const opp of opportunities) {
      if (TERMINAL_OPPORTUNITY_STAGES.has(opp.stage)) continue;

      const deals = await listDealsForOpportunity(opp.id);
      const openDealsForOpp = deals.filter((deal) => deal.status === "OPEN");
      const skipOpportunityAdvance =
        opp.stage === "NEGOTIATION" && openDealsForOpp.length > 0;

      if (!skipOpportunityAdvance) {
        items.push({
          id: `crm:opp:${opp.id}`,
          customerId: customer.id,
          customerName: customer.name,
          entity: "opportunity",
          entityId: opp.id,
          status: opp.stage,
          stage: opp.stage,
          label: `${customer.name} · Opportunity ${opp.stage} · ¥${opp.value}`,
          createdAt: opp.createdAt,
          rankValue: opp.value,
        });
      }

      for (const deal of openDealsForOpp) {
        items.push({
          id: `crm:deal:${deal.id}`,
          customerId: customer.id,
          customerName: customer.name,
          entity: "deal",
          entityId: deal.id,
          status: deal.status,
          amount: deal.amount,
          label: `${customer.name} · Deal OPEN · ¥${deal.amount}`,
          createdAt: deal.createdAt,
          rankValue: deal.amount,
        });
      }
    }
  }

  items.sort(compareCrmWorkItems);
  const orderedItems = items.map(toCrmWorkItem);

  return {
    items: orderedItems,
    qualifiedLeads: orderedItems.filter((i) => i.entity === "lead").length,
    activeOpportunities: orderedItems.filter((i) => i.entity === "opportunity").length,
    openDeals: orderedItems.filter((i) => i.entity === "deal").length,
  };
}
