/**
 * V60 P2 — Lead service
 */

import { prisma } from "@/lib/prisma";
import { crmDb, type LeadRow, type OpportunityRow } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";
import { isQualifiedLead, scoreLead, resolveLeadStatusFromScore } from "./lead.scoring";
import { nextLeadStage } from "./lead.pipeline";

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
