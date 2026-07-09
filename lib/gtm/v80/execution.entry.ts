/**
 * V80 GTM P2 — First revenue execution entry (spec exports)
 */
export { V80_GTM_EXECUTION_VERSION, V80_GTM_EXECUTION_FREEZE_VERSION } from "./execution.types";
export type {
  FirstDealExecutionStep,
  OfferPackItem,
  SalesScriptBeat,
  RevenueCapturePoint,
  ExecutionManifest,
  FirstRevenueExecutionReport,
} from "./execution.types";

export { FIRST_DEAL_EXECUTION_FLOW, isFirstDealExecutionFlowComplete } from "./execution.deal-flow.spec";
export { FIRST_DEAL_OFFER_PACK, isFirstDealOfferPackComplete } from "./execution.offer-pack.spec";
export { SALES_EXECUTION_SCRIPT, isSalesExecutionScriptComplete } from "./execution.sales-script.spec";
export { REVENUE_CAPTURE_MECHANISM, isRevenueCaptureMechanismComplete } from "./execution.revenue-capture.spec";

export {
  buildFirstRevenueExecution,
  buildExecutionManifest,
  assertFirstRevenueExecutionPass,
  formatExecutionSummary,
  runFirstRevenueExecution,
} from "./execution.builder";
