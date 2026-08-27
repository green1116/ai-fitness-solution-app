/**
 * V60 P2 — Lead service
 */

import { prisma } from "@/lib/prisma";
import { crmDb, type LeadRow, type OpportunityRow } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";
import { isQualifiedLead, scoreLead, resolveLeadStatusFromScore } from "./lead.scoring";
import { nextLeadStage } from "./lead.pipeline";

function readLeadIdFromActivityMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";
  return String((meta as { leadId?: unknown }).leadId ?? "").trim();
}

/**
 * Resolve an existing consultation CrmLead via lead.created activity
 * that recorded marketingLeadId (application-layer only; no schema unique).
 * Never reuses across tenant: customerId + Customer.organizationId must match.
 */
export async function findCrmLeadByMarketingLeadId(input: {
  marketingLeadId: string;
  customerId: string;
  organizationId: string;
}): Promise<LeadRow | null> {
  const marketingLeadId = input.marketingLeadId.trim();
  const customerId = input.customerId.trim();
  const organizationId = input.organizationId.trim();
  if (!marketingLeadId || !customerId || !organizationId) return null;

  const activity = await prisma.cRMActivity.findFirst({
    where: {
      type: "lead.created",
      customerId,
      meta: {
        path: ["marketingLeadId"],
        equals: marketingLeadId,
      },
    },
    orderBy: { timestamp: "asc" },
    select: { meta: true, customerId: true },
  });
  if (!activity) return null;

  const leadId = readLeadIdFromActivityMeta(activity.meta);
  if (!leadId) return null;

  const lead = await prisma.crmLead.findFirst({
    where: { id: leadId },
    include: { customer: { select: { organizationId: true } } },
  });
  if (!lead) return null;

  if (lead.customerId !== customerId) return null;
  if (lead.customer.organizationId !== organizationId) return null;

  return {
    id: lead.id,
    customerId: lead.customerId,
    source: lead.source,
    score: lead.score,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function createLead(input: {
  customerId: string;
  source?: string;
  score?: number;
  userId?: string;
  activityMeta?: Record<string, unknown>;
}): Promise<LeadRow> {
  const computedScore =
    input.score ??
    scoreLead({ source: input.source, hasQuote: input.source === "quote_generation" });

  const lead = await crmDb().crmLead.create({
    data: {
      customerId: input.customerId,
      source: input.source ?? "unknown",
      score: computedScore,
      status: resolveLeadStatusFromScore(computedScore),
    },
  });

  await logCRMActivity({
    customerId: input.customerId,
    type: "lead.created",
    meta: {
      leadId: lead.id,
      source: lead.source,
      score: lead.score,
      userId: input.userId,
      ...input.activityMeta,
    },
  });

  return lead;
}

/**
 * Reuse consultation CrmLead by marketingLeadId; create only if absent.
 * Concurrent callers for the same org + marketingLeadId are serialized.
 * Never reuses across tenant (customerId + organizationId must match).
 * Scans ALL matching activities — does not rely on first/orderBy alone.
 */
export async function findOrCreateConsultationLeadByMarketingId(input: {
  customerId: string;
  organizationId: string;
  marketingLeadId: string;
  email?: string;
  planId?: string;
  userId?: string;
  score?: number;
}): Promise<LeadRow> {
  const marketingLeadId = input.marketingLeadId.trim();
  const customerId = input.customerId.trim();
  const organizationId = input.organizationId.trim();
  if (!marketingLeadId) {
    throw new Error("marketingLeadId required");
  }
  if (!customerId || !organizationId) {
    throw new Error("customerId and organizationId required");
  }

  const ownedCustomer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
    select: { id: true },
  });
  if (!ownedCustomer) {
    throw new Error("Customer not found for organization");
  }

  const lockKey = `crm:consult-lead:${organizationId}:${marketingLeadId}`;
  const computedScore =
    input.score ?? scoreLead({ source: "enterprise_consultation" });

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const activities = await tx.cRMActivity.findMany({
        where: {
          type: "lead.created",
          customerId,
          meta: {
            path: ["marketingLeadId"],
            equals: marketingLeadId,
          },
        },
        select: { meta: true },
      });

      const candidateLeadIds: string[] = [];
      const seenLeadIds = new Set<string>();
      for (const activity of activities) {
        const leadId = readLeadIdFromActivityMeta(activity.meta);
        if (!leadId || seenLeadIds.has(leadId)) continue;
        seenLeadIds.add(leadId);
        candidateLeadIds.push(leadId);
      }

      if (candidateLeadIds.length > 0) {
        const candidates = await tx.crmLead.findMany({
          where: { id: { in: candidateLeadIds } },
          include: { customer: { select: { organizationId: true } } },
        });
        const byId = new Map(candidates.map((c) => [c.id, c]));

        for (const leadId of candidateLeadIds) {
          const existing = byId.get(leadId);
          if (
            existing &&
            existing.customerId === customerId &&
            existing.customer.organizationId === organizationId
          ) {
            return {
              id: existing.id,
              customerId: existing.customerId,
              source: existing.source,
              score: existing.score,
              status: existing.status,
              createdAt: existing.createdAt,
              updatedAt: existing.updatedAt,
            };
          }
        }
        // No valid candidate among existing activities — create once below.
      }

      const lead = await tx.crmLead.create({
        data: {
          customerId,
          source: "enterprise_consultation",
          score: computedScore,
          status: resolveLeadStatusFromScore(computedScore),
        },
      });

      await tx.cRMActivity.create({
        data: {
          customerId,
          type: "lead.created",
          meta: {
            leadId: lead.id,
            source: lead.source,
            score: lead.score,
            userId: input.userId,
            marketingLeadId,
            email: input.email,
            planId: input.planId,
          },
        },
      });

      return lead;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function scoreLeadById(leadId: string, input: Parameters<typeof scoreLead>[0]) {
  const lead = await crmDb().crmLead.findFirst({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const newScore = scoreLead(input);
  const status = nextLeadStage(lead.status as "NEW" | "QUALIFIED" | "LOST", newScore);

  const updated = await crmDb().crmLead.update({
    where: { id: leadId },
    data: { score: newScore, status },
  });

  await logCRMActivity({
    customerId: lead.customerId,
    type: "lead.scored",
    meta: { leadId, score: newScore, status },
  });

  return updated;
}

export async function promoteLeadToOpportunity(input: {
  leadId: string;
  value?: number;
  userId?: string;
}): Promise<{ lead: LeadRow; opportunity: OpportunityRow }> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`promote:${input.leadId}`}))`;

    const lead = await tx.crmLead.findFirst({ where: { id: input.leadId } });
    if (!lead) throw new Error("Lead not found");
    if (!isQualifiedLead(lead.score) && lead.status !== "QUALIFIED") {
      throw new Error("Lead must be qualified before promotion to opportunity");
    }

    const existingOpportunity = await tx.opportunity.findFirst({
      where: { leadId: lead.id },
      orderBy: { createdAt: "asc" },
    });
    if (existingOpportunity) {
      return { lead, opportunity: existingOpportunity };
    }

    const opportunity = await tx.opportunity.create({
      data: {
        customerId: lead.customerId,
        leadId: lead.id,
        stage: "INIT",
        value: input.value ?? 0,
      },
    });

    await tx.cRMActivity.create({
      data: {
        customerId: lead.customerId,
        type: "opportunity.created",
        meta: {
          opportunityId: opportunity.id,
          leadId: lead.id,
          value: opportunity.value,
          userId: input.userId,
        },
      },
    });

    await tx.cRMActivity.create({
      data: {
        customerId: lead.customerId,
        type: "lead.promoted",
        meta: { leadId: lead.id, opportunityId: opportunity.id },
      },
    });

    return { lead, opportunity };
  }, { maxWait: 10_000, timeout: 15_000 });
}

export async function listLeadsForCustomer(customerId: string) {
  return crmDb().crmLead.findMany({ where: { customerId } });
}
