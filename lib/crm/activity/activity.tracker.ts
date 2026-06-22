/**
 * V60 P2 — CRM activity tracking
 */

import { crmDb } from "../types";

export type CRMActivityType =
  | "customer.created"
  | "lifecycle.updated"
  | "lead.created"
  | "lead.scored"
  | "lead.promoted"
  | "opportunity.created"
  | "opportunity.stage_updated"
  | "deal.created"
  | "deal.progress"
  | "deal.closed_won"
  | "deal.closed_lost"
  | "quote.generated"
  | "budget.generated"
  | "tender.generated"
  | "sales.touchpoint"
  | "user.action";

export async function logCRMActivity(input: {
  customerId: string;
  type: CRMActivityType | string;
  meta?: Record<string, unknown>;
}) {
  return crmDb().cRMActivity.create({
    data: {
      customerId: input.customerId,
      type: input.type,
      meta: input.meta,
    },
  });
}

export async function logProductActivity(input: {
  customerId: string;
  product: "quote" | "budget" | "tender";
  resourceId?: string;
  userId?: string;
  organizationId?: string;
}) {
  const typeMap = {
    quote: "quote.generated",
    budget: "budget.generated",
    tender: "tender.generated",
  } as const;

  return logCRMActivity({
    customerId: input.customerId,
    type: typeMap[input.product],
    meta: {
      resourceId: input.resourceId,
      userId: input.userId,
      organizationId: input.organizationId,
    },
  });
}

export async function logSalesTouchpoint(input: {
  customerId: string;
  touchpoint: string;
  userId?: string;
  meta?: Record<string, unknown>;
}) {
  return logCRMActivity({
    customerId: input.customerId,
    type: "sales.touchpoint",
    meta: { touchpoint: input.touchpoint, userId: input.userId, ...input.meta },
  });
}
