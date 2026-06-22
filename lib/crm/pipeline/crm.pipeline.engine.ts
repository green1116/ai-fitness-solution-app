/**
 * V60 P2 — CRM pipeline engine (Lead → Opportunity → Deal)
 */

import { promoteLeadToOpportunity } from "../lead/lead.service";
import { updateOpportunityStage } from "../opportunity/opportunity.service";
import { createDeal, closeDealWon, closeDealLost } from "../deal/deal.service";
import type { LeadRow, OpportunityRow, DealRow } from "../types";

export type CRMPipelineState = {
  lead?: LeadRow;
  opportunity?: OpportunityRow;
  deal?: DealRow;
  stage: string;
};

export const CRM_SALES_FUNNEL = [
  "visitors",
  "leads",
  "qualified_leads",
  "opportunities",
  "deals",
  "revenue",
] as const;

export async function advanceLeadToOpportunity(input: {
  leadId: string;
  value?: number;
  userId?: string;
}): Promise<CRMPipelineState> {
  const { lead, opportunity } = await promoteLeadToOpportunity(input);
  return { lead, opportunity, stage: "opportunity" };
}

export async function advanceOpportunityToProposal(opportunityId: string, userId?: string) {
  const opportunity = await updateOpportunityStage({
    opportunityId,
    stage: "PROPOSAL",
    userId,
  });
  return { opportunity, stage: "proposal" };
}

export async function advanceOpportunityToNegotiation(opportunityId: string, userId?: string) {
  const opportunity = await updateOpportunityStage({
    opportunityId,
    stage: "NEGOTIATION",
    userId,
  });
  return { opportunity, stage: "negotiation" };
}

export async function openDealFromOpportunity(input: {
  opportunityId: string;
  amount?: number;
  userId?: string;
}) {
  const deal = await createDeal(input);
  return { deal, stage: "deal_open" };
}

export async function closePipelineWon(dealId: string, userId?: string) {
  const deal = await closeDealWon({ dealId, userId });
  return { deal, stage: "deal_won" };
}

export async function closePipelineLost(dealId: string, userId?: string) {
  const deal = await closeDealLost({ dealId, userId });
  return { deal, stage: "deal_lost" };
}

export function describeSalesFunnel(): readonly string[] {
  return CRM_SALES_FUNNEL;
}
