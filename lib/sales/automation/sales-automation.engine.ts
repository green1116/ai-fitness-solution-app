/**
 * V60 P3 — Sales automation engine (top-level automation orchestrator)
 */

import {
  autoAdvancePipeline,
  autoCreateOpportunityIfQualified,
  runPipelineAutomationForLead,
} from "./pipeline-automation";
import { evaluateStageAutomation } from "./stage-automation";
import { generateSalesSuggestion, recommendNextAction } from "../ai/sales-ai.engine";
import { countSignal } from "../sales.events.store";
import { getSignalSummary, recordQuoteSignal, recordBudgetView, recordTenderSignal } from "../signals/sales.signal.engine";

export type SalesAutomationResult = {
  suggestion: ReturnType<typeof generateSalesSuggestion>;
  pipeline: Awaited<ReturnType<typeof autoAdvancePipeline>>;
  signals: ReturnType<typeof getSignalSummary>;
};

export async function runSalesAutomation(input: {
  organizationId: string;
  customerId: string;
  leadId?: string;
  opportunityId?: string;
  companyName?: string;
  userId?: string;
}): Promise<SalesAutomationResult> {
  const signals = getSignalSummary(input.organizationId, input.customerId);

  const suggestion = generateSalesSuggestion({
    organizationId: input.organizationId,
    customerId: input.customerId,
    companyName: input.companyName,
  });

  const pipeline = await autoAdvancePipeline({
    organizationId: input.organizationId,
    customerId: input.customerId,
    leadId: input.leadId,
    opportunityId: input.opportunityId,
    leadScore: suggestion.leadQuality.score,
    userId: input.userId,
  });

  return { suggestion, pipeline, signals };
}

export {
  autoAdvancePipeline,
  autoCreateOpportunityIfQualified,
  runPipelineAutomationForLead,
  evaluateStageAutomation,
  generateSalesSuggestion,
  recommendNextAction,
  getSignalSummary,
  recordQuoteSignal,
  recordBudgetView,
  recordTenderSignal,
  countSignal,
};
