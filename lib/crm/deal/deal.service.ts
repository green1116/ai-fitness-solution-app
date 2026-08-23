/**
 * V60 P2 — Deal service
 */

import { prisma } from "@/lib/prisma";
import { crmDb, type DealRow } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";
import {
  canAdvanceOpportunityStage,
  type OpportunityStageName,
} from "../opportunity/opportunity.stage";
import { calculateDealValue } from "./deal.value";

export async function createDeal(input: {
  opportunityId: string;
  amount?: number;
  userId?: string;
}): Promise<DealRow> {
  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: input.opportunityId },
  });
  if (!opportunity) throw new Error("Opportunity not found");

  const amount = calculateDealValue({ opportunity, amount: input.amount });

  const deal = await crmDb().deal.create({
    data: {
      opportunityId: input.opportunityId,
      amount,
      status: "OPEN",
    },
  });

  await logCRMActivity({
    customerId: opportunity.customerId,
    type: "deal.created",
    meta: { dealId: deal.id, opportunityId: opportunity.id, amount, userId: input.userId },
  });

  return deal;
}

/** Idempotent open: reuse existing OPEN deal for the opportunity, else create one. */
export async function openDealForOpportunity(input: {
  opportunityId: string;
  amount?: number;
  userId?: string;
}): Promise<{ deal: DealRow; reused: boolean }> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`open-deal:${input.opportunityId}`}))`;

    const existingOpen = await tx.deal.findFirst({
      where: { opportunityId: input.opportunityId, status: "OPEN" },
      orderBy: { createdAt: "asc" },
    });
    if (existingOpen) {
      return { deal: existingOpen, reused: true };
    }

    const opportunity = await tx.opportunity.findFirst({
      where: { id: input.opportunityId },
    });
    if (!opportunity) throw new Error("Opportunity not found");

    const amount = calculateDealValue({ opportunity, amount: input.amount });

    const deal = await tx.deal.create({
      data: {
        opportunityId: input.opportunityId,
        amount,
        status: "OPEN",
      },
    });

    await tx.cRMActivity.create({
      data: {
        customerId: opportunity.customerId,
        type: "deal.created",
        meta: {
          dealId: deal.id,
          opportunityId: opportunity.id,
          amount,
          userId: input.userId,
        },
      },
    });

    return { deal, reused: false };
  }, { maxWait: 10_000, timeout: 15_000 });
}

export async function closeDealWon(input: { dealId: string; userId?: string }) {
  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");
  if (deal.status === "CLOSED_WON") {
    return deal;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.deal.update({
      where: { id: input.dealId },
      data: { status: "CLOSED_WON" },
    });

    const opportunity = await tx.opportunity.findFirst({
      where: { id: deal.opportunityId },
    });
    if (opportunity) {
      const current = opportunity.stage as OpportunityStageName;
      const stage: OpportunityStageName = "WON";
      if (!canAdvanceOpportunityStage(current, stage) && current !== stage) {
        throw new Error(`Invalid stage transition: ${current} → ${stage}`);
      }

      await tx.opportunity.update({
        where: { id: opportunity.id },
        data: { stage },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "opportunity.stage_updated",
          meta: {
            opportunityId: opportunity.id,
            from: current,
            to: stage,
            userId: input.userId,
          },
        },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "deal.closed_won",
          meta: {
            dealId: deal.id,
            amount: updated.amount,
            userId: input.userId,
          },
        },
      });
    }

    return updated;
  });
}

export async function closeDealLost(input: { dealId: string; userId?: string }) {
  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");
  if (deal.status === "CLOSED_LOST") {
    return deal;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.deal.update({
      where: { id: input.dealId },
      data: { status: "CLOSED_LOST" },
    });

    const opportunity = await tx.opportunity.findFirst({
      where: { id: deal.opportunityId },
    });
    if (opportunity) {
      const current = opportunity.stage as OpportunityStageName;
      const stage: OpportunityStageName = "LOST";
      if (!canAdvanceOpportunityStage(current, stage) && current !== stage) {
        throw new Error(`Invalid stage transition: ${current} → ${stage}`);
      }

      await tx.opportunity.update({
        where: { id: opportunity.id },
        data: { stage },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "opportunity.stage_updated",
          meta: {
            opportunityId: opportunity.id,
            from: current,
            to: stage,
            userId: input.userId,
          },
        },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "deal.closed_lost",
          meta: {
            dealId: deal.id,
            amount: updated.amount,
            userId: input.userId,
          },
        },
      });
    }

    return updated;
  });
}

export async function listDealsForOpportunity(opportunityId: string) {
  return crmDb().deal.findMany({ where: { opportunityId } });
}

export { calculateDealValue } from "./deal.value";
export { trackDealProgress } from "./deal.tracker";
