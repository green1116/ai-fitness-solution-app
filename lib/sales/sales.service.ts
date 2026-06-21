/**
 * V60 P3 — Sales service public API
 */

export {
  analyzeLeadIntent,
  scoreLeadQuality,
  predictDealProbability,
  recommendNextAction,
  generateSalesSuggestion,
  triggerQuoteRecommendation,
  triggerBudgetRecommendation,
  triggerTenderRecommendation,
} from "./ai/sales-ai.engine";

export {
  runSalesAutomation,
  autoAdvancePipeline,
  autoCreateOpportunityIfQualified,
} from "./automation/sales-automation.engine";

export { getSignalSummary, recordQuoteSignal } from "./signals/sales.signal.engine";
export { onQuoteGenerated, onBudgetCalculated, onTenderGenerated } from "./sales.product-bridge";
