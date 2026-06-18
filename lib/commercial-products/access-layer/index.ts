/**
 * V47 Commercial Products — Phase 2 Access Layer.
 * Read-only access over frozen P1 product packaging.
 */
export * from "./shared/constants";
export * from "./shared/types";

export { createQuote } from "./quote/quote-service";
export { runQuoteRuntime, getQuoteRuntimeMeta } from "./quote/quote-runtime";
export { checkProductEligibility, validateCommercialQuote } from "./validation/sales-access-validation";
export { validateSalesPortal } from "./validation/sales-portal-validation";
export { validateCommercialSummaryPdf } from "./validation/summary-pdf-validation";
export { buildSalesPortalRegistry, getSalesPortalProductCard, getSalesPortalApiPaths } from "./portal/portal-registry";
export { buildSalesPortalView } from "./portal/portal-builder";
export {
  runSummaryPdfRuntime,
  resolveQuoteSnapshotForPdf,
  getSummaryPdfRuntimeMeta,
  CP_MIN_SUMMARY_SECTION_COUNT,
} from "./pdf/summary-pdf-runtime";
export {
  runSummaryPdfRuntimeHeavy,
  resolveQuoteSnapshotForPdfHeavy,
  registerQuoteSnapshotHeavy,
} from "./runtime/heavy-summary-pdf";
export {
  registerQuoteSnapshot,
  getQuoteSnapshotById,
  clearQuoteSnapshotRegistry,
} from "./pdf/quote-snapshot-registry";
export {
  runDeliverablePdfRuntime,
  getDeliverablePdfRuntimeMeta,
} from "./pdf/deliverable-pdf-runtime";
export { routeDeliverablePdf, buildDeliverableRoutingContext } from "./pdf/deliverable-pdf-router";
export { runDeliverablePdfRuntimeHeavy } from "./runtime/heavy-deliverable-pdf";
export { validateCommercialDeliverableRouter } from "./validation/deliverable-router-validation";
export type {
  DeliverablePdfRequest,
  DeliverablePdfResult,
  DeliverableRoutingContext,
  CommercialDeliverableRouterValidation,
} from "./pdf/deliverable-pdf-types";
export type {
  DeliverableRouteType,
  DeliverablePdfSource,
} from "./shared/deliverable-types";
export { DELIVERABLE_ROUTE_TYPE, CP_DELIVERABLE_PDF_API_PATH } from "./shared/deliverable-types";
export type {
  SummaryPdfRequest,
  SummaryPdfResult,
  SummaryPdfSection,
  SummaryPdfContext,
  SummaryPdfMeta,
  CommercialSummaryPdfValidation,
} from "./pdf/pdf-context";
