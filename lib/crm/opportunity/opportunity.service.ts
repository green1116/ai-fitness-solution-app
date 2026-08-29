/**
 * V60 P2 — Opportunity service
 */

import { crmDb, type OpportunityRow } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";
import {
  canAdvanceOpportunityStage,
  type OpportunityStageName,
} from "./opportunity.stage";

export async function createOpportunity(input: {
  customerId: string;
  leadId?: string;
  stage?: string;
  value?: number;
  userId?: string;
}): Promise<OpportunityRow> {
  const opportunity = await crmDb().opportunity.create({
    data: {
      customerId: input.customerId,
      leadId: input.leadId,
      stage: input.stage ?? "INIT",
      value: input.value ?? 0,
    },
  });

  await logCRMActivity({
    customerId: input.customerId,
    type: "opportunity.created",
    meta: {
      opportunityId: opportunity.id,
      leadId: input.leadId,
      value: opportunity.value,
      userId: input.userId,
    },
  });

  return opportunity;
}

export async function updateOpportunityStage(input: {
  opportunityId: string;
  stage: OpportunityStageName;
  userId?: string;
  reason?: string;
  survivorLeadId?: string;
  marketingLeadId?: string;
}) {
  const opportunity = await crmDb().opportunity.findFirst({
    where: { id: input.opportunityId },
  });
  if (!opportunity) throw new Error("Opportunity not found");

  const current = opportunity.stage as OpportunityStageName;
  if (current === input.stage) {
    return opportunity;
  }

  if (!canAdvanceOpportunityStage(current, input.stage)) {
    throw new Error(`Invalid stage transition: ${current} → ${input.stage}`);
  }

  const updated = await crmDb().opportunity.update({
    where: { id: input.opportunityId },
    data: { stage: input.stage },
  });

  await logCRMActivity({
    customerId: opportunity.customerId,
    type: "opportunity.stage_updated",
    meta: {
      opportunityId: opportunity.id,
      from: current,
      to: input.stage,
      userId: input.userId,
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
      ...(input.survivorLeadId !== undefined
        ? { survivorLeadId: input.survivorLeadId }
        : {}),
      ...(input.marketingLeadId !== undefined
        ? { marketingLeadId: input.marketingLeadId }
        : {}),
    },
  });

  return updated;
}

export async function listOpportunitiesForCustomer(customerId: string) {
  return crmDb().opportunity.findMany({ where: { customerId } });
}

export async function updateOpportunityValue(opportunityId: string, value: number) {
  return crmDb().opportunity.update({
    where: { id: opportunityId },
    data: { value },
  });
}
