/**
 * V44 Win-Loss Intelligence — Phase 1.
 * Read-only extension over V41 Tender KG / V42 Decision / V43 Procurement.
 */
export * from "./shared/constants";
export * from "./shared/types";

export type { ProcurementDecisionLevel } from "@/lib/procurement-intelligence";
export {
  CANONICAL_EQUIVALENT_TENDER_ID,
  runEquivalentDecisionEngine,
} from "@/lib/equivalent-product-intelligence";
export { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";

export * from "./win-loss-foundation/outcome-types";
export { buildOutcomeRegistry } from "./win-loss-foundation/outcome-registry";
export { validateWinLossFoundation } from "./win-loss-foundation/outcome-validation";

export * from "./analytics/analytics-types";
export { buildBrandWinRateAnalytics } from "./analytics/brand-winrate-analytics";
export { buildSupplierWinRateAnalytics } from "./analytics/supplier-winrate-analytics";
export { buildProductWinRateAnalytics } from "./analytics/product-winrate-analytics";
export { buildProcurementWinRateAnalytics } from "./analytics/procurement-winrate-analytics";
export { buildWinLossAnalyticsContext } from "./analytics/analytics-context";
export { validateWinLossAnalytics } from "./analytics/analytics-validation";

export * from "./reason-intelligence/reason-types";
export { buildBrandReasonAnalysis } from "./reason-intelligence/brand-reason-analysis";
export { buildProductReasonAnalysis } from "./reason-intelligence/product-reason-analysis";
export { buildSupplierReasonAnalysis } from "./reason-intelligence/supplier-reason-analysis";
export { buildProcurementReasonAnalysis } from "./reason-intelligence/procurement-reason-analysis";
export { buildOutcomeReasonContext } from "./reason-intelligence/outcome-reason-context";
export {
  buildOutcomeReasons,
  buildRootCauseAnalysis,
} from "./reason-intelligence/outcome-reason-builder";
export { validateReasonIntelligence } from "./reason-intelligence/reason-validation";
