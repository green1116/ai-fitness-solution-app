/**
 * CRM Workspace Surface — read-only assembler for operator visibility.
 * Org-scoped, deterministic, reuses existing CRM read services.
 */

import { listCustomers } from "./customer/customer.service";
import { listLeadsForCustomer } from "./lead/lead.service";
import { listOpportunitiesForCustomer } from "./opportunity/opportunity.service";
import { listDealsForOpportunity } from "./deal/deal.service";
import { buildOrganizationTimeline } from "./activity/activity.timeline";

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
  outcomes: readonly CrmOutcomeItem[];
  qualifiedLeads: number;
  activeOpportunities: number;
  openDeals: number;
}>;

export type CrmOutcomeItem = Readonly<{
  id: string;
  timestamp: Date;
  customerName: string;
  entity: string;
  entityId: string | null;
  event: string;
  from: string | null;
  to: string | null;
  userId: string | null;
}>;

const CRM_OUTCOME_TYPES = new Set([
  "lead.promoted",
  "opportunity.stage_updated",
  "deal.closed_won",
]);

function metaString(
  meta: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = meta?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function outcomeEntity(event: string): { entity: string; idKey: string } {
  if (event === "lead.promoted") return { entity: "lead", idKey: "leadId" };
  if (event === "deal.closed_won") return { entity: "deal", idKey: "dealId" };
  return { entity: "opportunity", idKey: "opportunityId" };
}

async function listCrmOutcomes(
  organizationId: string,
): Promise<CrmOutcomeItem[]> {
  const timelines = await buildOrganizationTimeline(organizationId, 100);
  const outcomes: CrmOutcomeItem[] = [];

  for (const timeline of timelines) {
    for (const activity of timeline.activities) {
      if (!CRM_OUTCOME_TYPES.has(activity.type)) continue;
      const { entity, idKey } = outcomeEntity(activity.type);
      outcomes.push({
        id: activity.id,
        timestamp: activity.timestamp,
        customerName: timeline.customerName,
        entity,
        entityId: metaString(activity.meta, idKey),
        event: activity.type,
        from: metaString(activity.meta, "from"),
        to: metaString(activity.meta, "to"),
        userId: metaString(activity.meta, "userId"),
      });
    }
  }

  return outcomes
    .sort((a, b) => {
      const timeDiff = b.timestamp.getTime() - a.timestamp.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    })
    .slice(0, 10);
}

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
  const outcomes = await listCrmOutcomes(organizationId);

  return {
    items: orderedItems,
    outcomes,
    qualifiedLeads: orderedItems.filter((i) => i.entity === "lead").length,
    activeOpportunities: orderedItems.filter((i) => i.entity === "opportunity").length,
    openDeals: orderedItems.filter((i) => i.entity === "deal").length,
  };
}
