/**
 * V60 P3 — Sales product bridge (non-blocking hooks from product APIs)
 */

import { recordQuoteSignal, recordBudgetView, recordTenderSignal, markHotDeal } from "./signals/sales.signal.engine";
import { runSalesAutomation } from "./automation/sales-automation.engine";
import { triggerTenderRecommendation } from "./recommendation/tender.recommender";

export async function onQuoteGenerated(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  quoteId?: string;
  companyName?: string;
  isRepeat?: boolean;
  leadId?: string;
}) {
  try {
    recordQuoteSignal({
      organizationId: input.organizationId,
      customerId: input.customerId,
      userId: input.userId,
      quoteId: input.quoteId,
      isRepeat: input.isRepeat,
    });

    if (input.customerId && input.leadId) {
      return await runSalesAutomation({
        organizationId: input.organizationId,
        customerId: input.customerId,
        leadId: input.leadId,
        companyName: input.companyName,
        userId: input.userId,
      });
    }
  } catch (err) {
    console.error("[sales/onQuoteGenerated]", err);
  }
  return null;
}

export async function onBudgetCalculated(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  exported?: boolean;
  leadId?: string;
  opportunityId?: string;
}) {
  try {
    recordBudgetView({
      organizationId: input.organizationId,
      customerId: input.customerId,
      userId: input.userId,
      exported: input.exported,
    });

    if (input.customerId) {
      const tenderRec = triggerTenderRecommendation({
        organizationId: input.organizationId,
        customerId: input.customerId,
      });

      const automation = await runSalesAutomation({
        organizationId: input.organizationId,
        customerId: input.customerId,
        leadId: input.leadId,
        opportunityId: input.opportunityId,
        userId: input.userId,
      });

      return { tenderRecommendation: tenderRec, automation };
    }
  } catch (err) {
    console.error("[sales/onBudgetCalculated]", err);
  }
  return null;
}

export async function onTenderGenerated(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  tenderId?: string;
  dealId?: string;
  leadId?: string;
  opportunityId?: string;
}) {
  try {
    recordTenderSignal({
      organizationId: input.organizationId,
      customerId: input.customerId,
      userId: input.userId,
      tenderId: input.tenderId,
    });

    if (input.customerId) {
      markHotDeal({
        organizationId: input.organizationId,
        customerId: input.customerId,
        dealId: input.dealId,
      });

      return await runSalesAutomation({
        organizationId: input.organizationId,
        customerId: input.customerId,
        leadId: input.leadId,
        opportunityId: input.opportunityId,
        userId: input.userId,
      });
    }
  } catch (err) {
    console.error("[sales/onTenderGenerated]", err);
  }
  return null;
}
