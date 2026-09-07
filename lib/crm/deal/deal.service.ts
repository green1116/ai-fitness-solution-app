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

type CloseDealTargetStatus = "CLOSED_WON" | "CLOSED_LOST";
type CloseDealTargetStage = "WON" | "LOST";

/**
 * After a failed OPEN→terminal conditional write (or failed NEGOTIATION+OPEN gate),
 * classify from a locked re-read: idempotent return vs opposite-terminal / stage-changed.
 */
function resolveCloseDealContention(input: {
  deal: DealRow;
  opportunityStage: string | null | undefined;
  targetStatus: CloseDealTargetStatus;
}): DealRow {
  if (input.deal.status === input.targetStatus) {
    return input.deal;
  }
  const opposite: CloseDealTargetStatus =
    input.targetStatus === "CLOSED_WON" ? "CLOSED_LOST" : "CLOSED_WON";
  if (input.deal.status === opposite) {
    throw new Error("opposite-terminal");
  }
  const stage = (input.opportunityStage ?? "").trim().toUpperCase();
  if (stage !== "NEGOTIATION") {
    throw new Error("stage-changed");
  }
  throw new Error("stage-changed");
}

export async function closeDealWon(input: { dealId: string; userId?: string }) {
  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");
  if (deal.status === "CLOSED_WON") {
    return deal;
  }

  const targetStatus: CloseDealTargetStatus = "CLOSED_WON";
  const targetStage: CloseDealTargetStage = "WON";

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`open-deal:${deal.opportunityId}`}))`;

      const lockedDeal = await tx.deal.findFirst({
        where: { id: input.dealId },
      });
      if (!lockedDeal) throw new Error("Deal not found");

      const opportunity = await tx.opportunity.findFirst({
        where: { id: lockedDeal.opportunityId },
      });
      if (!opportunity) throw new Error("Opportunity not found");

      const current = opportunity.stage as OpportunityStageName;
      const stageNormalized = current.trim().toUpperCase();

      if (stageNormalized !== "NEGOTIATION" || lockedDeal.status !== "OPEN") {
        return resolveCloseDealContention({
          deal: lockedDeal,
          opportunityStage: opportunity.stage,
          targetStatus,
        });
      }

      const updatedCount = await tx.deal.updateMany({
        where: { id: input.dealId, status: "OPEN" },
        data: { status: targetStatus },
      });

      if (updatedCount.count !== 1) {
        const rereadDeal = await tx.deal.findFirst({
          where: { id: input.dealId },
        });
        if (!rereadDeal) throw new Error("Deal not found");
        const rereadOpp = await tx.opportunity.findFirst({
          where: { id: rereadDeal.opportunityId },
        });
        return resolveCloseDealContention({
          deal: rereadDeal,
          opportunityStage: rereadOpp?.stage,
          targetStatus,
        });
      }

      const updated = await tx.deal.findFirstOrThrow({
        where: { id: input.dealId },
      });

      if (!canAdvanceOpportunityStage(current, targetStage) && current !== targetStage) {
        throw new Error(`Invalid stage transition: ${current} → ${targetStage}`);
      }

      await tx.opportunity.update({
        where: { id: opportunity.id },
        data: { stage: targetStage },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "opportunity.stage_updated",
          meta: {
            opportunityId: opportunity.id,
            from: current,
            to: targetStage,
            userId: input.userId,
          },
        },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "deal.closed_won",
          meta: {
            dealId: lockedDeal.id,
            amount: updated.amount,
            userId: input.userId,
          },
        },
      });

      return updated;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function closeDealLost(input: {
  dealId: string;
  userId?: string;
  reason?: string;
  survivorDealId?: string;
  survivorOpportunityId?: string;
  marketingLeadId?: string;
}) {
  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");
  if (deal.status === "CLOSED_LOST") {
    return deal;
  }

  const reconciliationMeta = {
    ...(input.reason !== undefined ? { reason: input.reason } : {}),
    ...(input.survivorDealId !== undefined
      ? { survivorDealId: input.survivorDealId }
      : {}),
    ...(input.survivorOpportunityId !== undefined
      ? { survivorOpportunityId: input.survivorOpportunityId }
      : {}),
    ...(input.marketingLeadId !== undefined
      ? { marketingLeadId: input.marketingLeadId }
      : {}),
  };

  const targetStatus: CloseDealTargetStatus = "CLOSED_LOST";
  const targetStage: CloseDealTargetStage = "LOST";

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`open-deal:${deal.opportunityId}`}))`;

      const lockedDeal = await tx.deal.findFirst({
        where: { id: input.dealId },
      });
      if (!lockedDeal) throw new Error("Deal not found");

      const opportunity = await tx.opportunity.findFirst({
        where: { id: lockedDeal.opportunityId },
      });
      if (!opportunity) throw new Error("Opportunity not found");

      const current = opportunity.stage as OpportunityStageName;
      const stageNormalized = current.trim().toUpperCase();

      if (stageNormalized !== "NEGOTIATION" || lockedDeal.status !== "OPEN") {
        return resolveCloseDealContention({
          deal: lockedDeal,
          opportunityStage: opportunity.stage,
          targetStatus,
        });
      }

      const updatedCount = await tx.deal.updateMany({
        where: { id: input.dealId, status: "OPEN" },
        data: { status: targetStatus },
      });

      if (updatedCount.count !== 1) {
        const rereadDeal = await tx.deal.findFirst({
          where: { id: input.dealId },
        });
        if (!rereadDeal) throw new Error("Deal not found");
        const rereadOpp = await tx.opportunity.findFirst({
          where: { id: rereadDeal.opportunityId },
        });
        return resolveCloseDealContention({
          deal: rereadDeal,
          opportunityStage: rereadOpp?.stage,
          targetStatus,
        });
      }

      const updated = await tx.deal.findFirstOrThrow({
        where: { id: input.dealId },
      });

      if (!canAdvanceOpportunityStage(current, targetStage) && current !== targetStage) {
        throw new Error(`Invalid stage transition: ${current} → ${targetStage}`);
      }

      await tx.opportunity.update({
        where: { id: opportunity.id },
        data: { stage: targetStage },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "opportunity.stage_updated",
          meta: {
            opportunityId: opportunity.id,
            from: current,
            to: targetStage,
            userId: input.userId,
            ...reconciliationMeta,
          },
        },
      });

      await tx.cRMActivity.create({
        data: {
          customerId: opportunity.customerId,
          type: "deal.closed_lost",
          meta: {
            dealId: lockedDeal.id,
            amount: updated.amount,
            userId: input.userId,
            ...reconciliationMeta,
          },
        },
      });

      return updated;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function listDealsForOpportunity(opportunityId: string) {
  return crmDb().deal.findMany({ where: { opportunityId } });
}

export { calculateDealValue } from "./deal.value";
export { trackDealProgress } from "./deal.tracker";
