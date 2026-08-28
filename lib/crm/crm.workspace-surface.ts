/**
 * CRM Workspace Surface — read-only assembler for operator visibility.
 * Org-scoped, deterministic, reuses existing CRM read services.
 */

import { prisma } from "@/lib/prisma";
import { listCustomers } from "./customer/customer.service";
import { buildOrganizationTimeline, limitActivitiesPerCustomer } from "./activity/activity.timeline";
import {
  buildRevenueIntelligenceSnapshot,
  type RevenueIntelligenceSnapshot,
} from "./crm.metrics";
import { type DealRow, type LeadRow, type OpportunityRow } from "./types";

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
  contactEmail?: string;
  sourceLabel?: string;
  projectId?: string;
  quoteId?: string;
  budgetId?: string;
}>;

export type CrmWorkSurface = Readonly<{
  items: readonly CrmWorkItem[];
  outcomes: readonly CrmOutcomeItem[];
  consultQueue: readonly MarketingConsultQueueItem[];
  consultInitQueue: readonly ConsultInitQueueItem[];
  intelligence: RevenueIntelligenceSnapshot;
  qualifiedLeads: number;
  activeOpportunities: number;
  openDeals: number;
}>;

export type ConsultInitQueueItem = Readonly<{
  id: string;
  opportunityId: string;
  customerId: string;
  customerName: string;
  leadScore: number;
  createdAt: Date;
  contactEmail?: string;
  contactPhone?: string;
  sourceLabel?: string;
}>;

export type MarketingConsultQueueItem = Readonly<{
  id: string;
  company: string | null;
  name: string | null;
  email: string;
  status: string;
  createdAt: Date;
  projectId?: string;
  phone?: string;
  title?: string;
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

const ENTERPRISE_CONSULT_SOURCE = "enterprise_consultation";
const ENTERPRISE_CONSULT_LABEL = "Enterprise Consultation";

function metaString(
  meta: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = meta?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asMeta(meta: unknown): Record<string, unknown> | null {
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return null;
}

function isSafeAttributionId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,128}$/.test(value);
}

function parseConsultNoteAttribution(note: string | null | undefined): {
  projectId?: string;
  quoteId?: string;
  budgetId?: string;
} {
  if (!note) return {};
  const result: { projectId?: string; quoteId?: string; budgetId?: string } = {};
  for (const key of ["projectId", "quoteId", "budgetId"] as const) {
    const match = note.match(new RegExp(`${key}：([^；]+)`));
    const value = match?.[1]?.trim();
    if (value && isSafeAttributionId(value)) {
      result[key] = value;
    }
  }
  return result;
}

function parseConsultNoteContact(note: string | null | undefined): {
  phone?: string;
  title?: string;
} {
  if (!note) return {};
  const phone = note.match(/手机：([^；]+)/)?.[1]?.trim();
  const title = note.match(/职位：([^；]+)/)?.[1]?.trim();
  return {
    ...(phone ? { phone } : {}),
    ...(title ? { title } : {}),
  };
}

type ConsultVisibility = {
  contactEmail?: string;
  contactPhone?: string;
  sourceLabel?: string;
  projectId?: string;
  quoteId?: string;
  budgetId?: string;
};

type MarketingLeadContact = {
  id: string;
  email: string;
  phone: string | null;
  note: string | null;
};

async function loadLeadCreatedActivitiesByCustomerId(
  customerIds: readonly string[],
): Promise<Map<string, Array<{ meta: unknown }>>> {
  if (customerIds.length === 0) return new Map();

  const activities = await prisma.cRMActivity.findMany({
    where: {
      customerId: { in: [...customerIds] },
      type: "lead.created",
    },
    orderBy: { timestamp: "desc" },
    select: { customerId: true, meta: true },
  });

  return limitActivitiesPerCustomer(activities, 200);
}

function buildConsultVisibilityByCrmLeadId(
  crmLeads: readonly LeadRow[],
  leadCreatedActivities: readonly { meta: unknown }[],
  marketingById: ReadonlyMap<string, MarketingLeadContact>,
  crmMarketingLeadIds?: Set<string>,
): Map<string, ConsultVisibility> {
  const byCrmLeadId = new Map<string, ConsultVisibility>();
  const createdMetaByLeadId = new Map<string, Record<string, unknown>>();
  for (const activity of leadCreatedActivities) {
    const meta = asMeta(activity.meta);
    const leadId = metaString(meta, "leadId");
    if (!leadId || !meta || createdMetaByLeadId.has(leadId)) continue;
    createdMetaByLeadId.set(leadId, meta);
  }

  for (const meta of createdMetaByLeadId.values()) {
    const marketingLeadId = metaString(meta, "marketingLeadId");
    if (marketingLeadId) crmMarketingLeadIds?.add(marketingLeadId);
  }

  const sourceByCrmLeadId = new Map(crmLeads.map((lead) => [lead.id, lead.source]));

  for (const [crmLeadId, meta] of createdMetaByLeadId) {
    const marketingLeadId = metaString(meta, "marketingLeadId");
    const marketing = marketingLeadId ? marketingById.get(marketingLeadId) : undefined;
    const emailFromLead = marketing?.email?.trim();
    const contactEmail =
      emailFromLead && emailFromLead.length > 0
        ? emailFromLead
        : metaString(meta, "email") ?? undefined;

    const phoneFromLead = marketing?.phone?.trim();
    const noteContact = parseConsultNoteContact(marketing?.note);
    const contactPhone =
      phoneFromLead && phoneFromLead.length > 0
        ? phoneFromLead
        : noteContact.phone;

    const crmSource =
      sourceByCrmLeadId.get(crmLeadId) ?? metaString(meta, "source") ?? "";
    const attribution = parseConsultNoteAttribution(marketing?.note);

    const visibility: ConsultVisibility = {};
    if (contactEmail) visibility.contactEmail = contactEmail;
    if (contactPhone) visibility.contactPhone = contactPhone;
    if (crmSource === ENTERPRISE_CONSULT_SOURCE) {
      visibility.sourceLabel = ENTERPRISE_CONSULT_LABEL;
    }
    if (attribution.projectId) visibility.projectId = attribution.projectId;
    if (attribution.quoteId) visibility.quoteId = attribution.quoteId;
    if (attribution.budgetId) visibility.budgetId = attribution.budgetId;

    if (Object.keys(visibility).length > 0) {
      byCrmLeadId.set(crmLeadId, visibility);
    }
  }

  for (const lead of crmLeads) {
    if (lead.source !== ENTERPRISE_CONSULT_SOURCE) continue;
    const existing = byCrmLeadId.get(lead.id) ?? {};
    if (existing.sourceLabel) continue;
    byCrmLeadId.set(lead.id, {
      ...existing,
      sourceLabel: ENTERPRISE_CONSULT_LABEL,
    });
  }

  return byCrmLeadId;
}

function collectMarketingLeadIdsFromActivities(
  activitiesByCustomerId: ReadonlyMap<string, readonly { meta: unknown }[]>,
): string[] {
  const marketingLeadIds = new Set<string>();
  for (const activities of activitiesByCustomerId.values()) {
    for (const activity of activities) {
      const meta = asMeta(activity.meta);
      const marketingLeadId = metaString(meta, "marketingLeadId");
      if (marketingLeadId) marketingLeadIds.add(marketingLeadId);
    }
  }
  return [...marketingLeadIds];
}

async function listMarketingConsultQueue(
  organizationId: string,
  excludeMarketingLeadIds: ReadonlySet<string>,
): Promise<MarketingConsultQueueItem[]> {
  const leads = await prisma.lead.findMany({
    where: {
      intent: "consult",
      payload: {
        path: ["organizationId"],
        equals: organizationId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      company: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      note: true,
      payload: true,
    },
  });

  const items: MarketingConsultQueueItem[] = [];
  for (const lead of leads) {
    if (excludeMarketingLeadIds.has(lead.id)) continue;
    const payload = asMeta(lead.payload);
    if (metaString(payload, "crmBridge") === "synced") continue;

    const projectId = metaString(payload, "projectId") ?? undefined;
    const contact = parseConsultNoteContact(lead.note);
    items.push({
      id: lead.id,
      company: lead.company,
      name: lead.name,
      email: lead.email,
      status: lead.status,
      createdAt: lead.createdAt,
      ...(projectId ? { projectId } : {}),
      ...contact,
    });
  }
  return items;
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

export async function assembleCrmWorkSurface(
  organizationId: string,
): Promise<CrmWorkSurface> {
  const customers = await listCustomers(organizationId);
  const customerIds = customers.map((customer) => customer.id);
  const [allOpportunities, allLeads, leadCreatedActivitiesByCustomerId] =
    customerIds.length === 0
      ? [[], [], new Map<string, Array<{ meta: unknown }>>()] as const
      : await Promise.all([
          prisma.opportunity.findMany({
            where: { customerId: { in: customerIds } },
          }),
          prisma.crmLead.findMany({
            where: { customerId: { in: customerIds } },
          }),
          loadLeadCreatedActivitiesByCustomerId(customerIds),
        ]);
  const marketingLeadIds = collectMarketingLeadIdsFromActivities(
    leadCreatedActivitiesByCustomerId,
  );
  const marketingLeads =
    marketingLeadIds.length === 0
      ? []
      : await prisma.lead.findMany({
          where: { id: { in: marketingLeadIds } },
          select: { id: true, email: true, phone: true, note: true },
        });
  const marketingById = new Map(marketingLeads.map((lead) => [lead.id, lead]));
  const opportunityIds = allOpportunities.map((opp) => opp.id);
  const allDeals: DealRow[] =
    opportunityIds.length === 0
      ? []
      : await prisma.deal.findMany({
          where: { opportunityId: { in: opportunityIds } },
        });
  const opportunitiesByCustomerId = groupRowsByKey<OpportunityRow>(
    allOpportunities,
    "customerId",
  );
  const leadsByCustomerId = groupRowsByKey<LeadRow>(allLeads, "customerId");
  const dealsByOpportunityId = groupRowsByKey<DealRow>(allDeals, "opportunityId");

  const items: SortableCrmWorkItem[] = [];
  const consultInitQueue: ConsultInitQueueItem[] = [];
  const crmMarketingLeadIds = new Set<string>();
  const stageTotals = new Map<string, { count: number; totalValue: number }>();
  const consultLeadIds = new Set<string>();
  const consultOpportunityIds = new Set<string>();
  const consultWonOpportunityIds = new Set<string>();

  for (const customer of customers) {
    const opportunities = opportunitiesByCustomerId.get(customer.id) ?? [];
    const promotedLeadIds = new Set(
      opportunities
        .map((opp) => opp.leadId)
        .filter((leadId): leadId is string => Boolean(leadId)),
    );

    const leads = leadsByCustomerId.get(customer.id) ?? [];
    const leadsById = new Map(leads.map((lead) => [lead.id, lead]));
    const visibilityByLead = buildConsultVisibilityByCrmLeadId(
      leads,
      leadCreatedActivitiesByCustomerId.get(customer.id) ?? [],
      marketingById,
      crmMarketingLeadIds,
    );

    for (const lead of leads) {
      if (lead.source === ENTERPRISE_CONSULT_SOURCE) {
        consultLeadIds.add(lead.id);
      }
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
        ...visibilityByLead.get(lead.id),
      });
    }

    for (const opp of opportunities) {
      if (!TERMINAL_OPPORTUNITY_STAGES.has(opp.stage)) {
        const bucket = stageTotals.get(opp.stage) ?? { count: 0, totalValue: 0 };
        bucket.count += 1;
        bucket.totalValue += opp.value;
        stageTotals.set(opp.stage, bucket);
      }

      const isConsultOpp = Boolean(
        opp.leadId && consultLeadIds.has(opp.leadId),
      );
      const needsDeals =
        !TERMINAL_OPPORTUNITY_STAGES.has(opp.stage) || isConsultOpp;
      const deals = needsDeals
        ? dealsByOpportunityId.get(opp.id) ?? []
        : [];

      if (isConsultOpp) {
        consultOpportunityIds.add(opp.id);
        if (deals.some((deal) => deal.status === "CLOSED_WON")) {
          consultWonOpportunityIds.add(opp.id);
        }
      }

      if (TERMINAL_OPPORTUNITY_STAGES.has(opp.stage)) continue;

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
          ...(opp.leadId ? visibilityByLead.get(opp.leadId) : undefined),
        });
      }

      const linkedLead = opp.leadId ? leadsById.get(opp.leadId) : undefined;
      if (
        String(opp.stage).toUpperCase() === "INIT" &&
        linkedLead?.source === ENTERPRISE_CONSULT_SOURCE
      ) {
        const visibility = opp.leadId
          ? visibilityByLead.get(opp.leadId)
          : undefined;
        consultInitQueue.push({
          id: `crm:opp:${opp.id}`,
          opportunityId: opp.id,
          customerId: customer.id,
          customerName: customer.name,
          leadScore: linkedLead.score,
          createdAt: opp.createdAt,
          ...(visibility?.contactEmail
            ? { contactEmail: visibility.contactEmail }
            : {}),
          ...(visibility?.contactPhone
            ? { contactPhone: visibility.contactPhone }
            : {}),
          ...(visibility?.sourceLabel
            ? { sourceLabel: visibility.sourceLabel }
            : { sourceLabel: ENTERPRISE_CONSULT_LABEL }),
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
          ...(opp.leadId ? visibilityByLead.get(opp.leadId) : undefined),
        });
      }
    }
  }

  items.sort(compareCrmWorkItems);
  const orderedItems = items.map(toCrmWorkItem);
  consultInitQueue.sort((a, b) => {
    if (b.leadScore !== a.leadScore) return b.leadScore - a.leadScore;
    const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.opportunityId < b.opportunityId
      ? -1
      : a.opportunityId > b.opportunityId
        ? 1
        : 0;
  });
  const outcomes = await listCrmOutcomes(organizationId);
  const consultQueue = await listMarketingConsultQueue(
    organizationId,
    crmMarketingLeadIds,
  );

  const intelligence = buildRevenueIntelligenceSnapshot({
    stageTotals,
    consultLeadIds,
    consultOpportunityIds,
    consultWonOpportunityIds,
  });

  return {
    items: orderedItems,
    outcomes,
    consultQueue,
    consultInitQueue,
    intelligence,
    qualifiedLeads: orderedItems.filter((i) => i.entity === "lead").length,
    activeOpportunities: orderedItems.filter((i) => i.entity === "opportunity")
      .length,
    openDeals: orderedItems.filter((i) => i.entity === "deal").length,
  };
}
