/**
 * V60 P2 — Deal progress tracking
 */

import { crmDb } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";
import type { DealStatus } from "../types";
import { closeDealLost, closeDealWon } from "./deal.service";

export async function trackDealProgress(input: {
  dealId: string;
  status: DealStatus;
  userId?: string;
}) {
  if (input.status === "CLOSED_WON") {
    return closeDealWon({ dealId: input.dealId, userId: input.userId });
  }
  if (input.status === "CLOSED_LOST") {
    return closeDealLost({ dealId: input.dealId, userId: input.userId });
  }

  const deal = await crmDb().deal.findFirst({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");

  const updated = await crmDb().deal.update({
    where: { id: input.dealId },
    data: { status: input.status },
  });

  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: deal.opportunityId },
  });

  if (opportunity) {
    await logCRMActivity({
      customerId: opportunity.customerId,
      type: "deal.progress",
      meta: {
        dealId: deal.id,
        status: input.status,
        amount: updated.amount,
        userId: input.userId,
      },
    });
  }

  return updated;
}

export async function getDealProgress(dealId: string) {
  const deal = await crmDb().deal.findFirst({ where: { id: dealId } });
  if (!deal) return null;

  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: deal.opportunityId },
  });

  return {
    deal,
    opportunity,
    isClosed: deal.status.startsWith("CLOSED"),
    isWon: deal.status === "CLOSED_WON",
  };
}
