/**
 * V60 P2 — Deal service
 */

import { crmDb, type DealRow } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";
import { calculateDealValue } from "./deal.value";
import { updateOpportunityStage } from "../opportunity/opportunity.service";

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

export async function closeDealWon(input: { dealId: string; userId?: string }) {
  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");

  const updated = await crmDb().deal.update({
    where: { id: input.dealId },
    data: { status: "CLOSED_WON" },
  });

  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: deal.opportunityId },
  });
  if (opportunity) {
    await updateOpportunityStage({
      opportunityId: opportunity.id,
      stage: "WON",
      userId: input.userId,
    });
    await logCRMActivity({
      customerId: opportunity.customerId,
      type: "deal.closed_won",
      meta: { dealId: deal.id, amount: updated.amount, userId: input.userId },
    });
  }

  return updated;
}

export async function closeDealLost(input: { dealId: string; userId?: string }) {
  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");

  const updated = await crmDb().deal.update({
    where: { id: input.dealId },
    data: { status: "CLOSED_LOST" },
  });

  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: deal.opportunityId },
  });
  if (opportunity) {
    await updateOpportunityStage({
      opportunityId: opportunity.id,
      stage: "LOST",
      userId: input.userId,
    });
  }

  return updated;
}

export async function listDealsForOpportunity(opportunityId: string) {
  return crmDb().deal.findMany({ where: { opportunityId } });
}

export { calculateDealValue } from "./deal.value";
export { trackDealProgress } from "./deal.tracker";
