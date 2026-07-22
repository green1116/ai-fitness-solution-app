/**
 * Commercialization P1 — Sales Foundation public exports
 * Isolated namespace: lib/commercialization/p1
 */

export {
  COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
  COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
  CUSTOMER_LIFECYCLE_STAGES,
  OFFER_KINDS,
  OPPORTUNITY_STATUSES,
  PIPELINE_STAGES,
  PRICING_MODELS,
  SALES_MANAGER_STATUSES,
  SALES_READINESS_VERDICTS,
} from "./sales/sales.constants";

export type {
  AdvancePipelineInput,
  ComputeSalesMetricsInput,
  OpportunityStatus,
  PipelineEntry,
  PipelineStage,
  RegisterOpportunityInput,
  SalesManagerStatus,
  SalesMetrics,
  SalesOpportunity,
  SalesReadinessCheck,
  SalesReadinessResult,
  SalesReadinessVerdict,
  SalesRegistryManifest,
} from "./sales/sales.types";

export {
  clearOpportunities,
  getOpportunity,
  listOpportunities,
  registerOpportunity,
  updateOpportunityStage,
} from "./sales/sales.registry";

export {
  advancePipeline,
  clearPipelineEntries,
  getPipelineEntry,
  listPipelineEntries,
} from "./sales/sales.pipeline";

export {
  clearSalesMetrics,
  computeSalesMetrics,
  getSalesMetrics,
  listSalesMetrics,
} from "./sales/sales.metrics";

export type {
  CustomerLifecycleRecord,
  CustomerLifecycleStage,
  RegisterCustomerInput,
  SalesCustomer,
  TransitionCustomerLifecycleInput,
} from "./customer/customer.types";

export {
  clearSalesCustomers,
  getSalesCustomer,
  listSalesCustomers,
  registerCustomer,
  setCustomerLifecycleStage,
} from "./customer/customer.registry";

export {
  clearCustomerLifecycleRecords,
  getCustomerLifecycleRecord,
  listCustomerLifecycleRecords,
  transitionCustomerLifecycle,
} from "./customer/customer.lifecycle";

export type {
  CommercialOffer,
  CreateOfferPricingInput,
  OfferKind,
  OfferPricing,
  PricingModel,
  RegisterOfferInput,
} from "./offer/offer.types";

export {
  clearCommercialOffers,
  getCommercialOffer,
  listCommercialOffers,
  registerOffer,
} from "./offer/offer.catalog";

export {
  clearOfferPricing,
  createOfferPricing,
  getOfferPricing,
  listOfferPricing,
} from "./offer/offer.pricing";

export {
  assertSalesFoundationReadinessReady,
  evaluateSalesFoundationReadiness,
} from "./sales.readiness";

export {
  clearSalesFoundationLayer,
  createSalesFoundationManager,
  getSalesRegistryManifest,
  type SalesFoundationManager,
  type SalesFoundationManagerSnapshot,
} from "./sales.manager";

export {
  assertCommercializationP1ReleaseGatePass,
  checkCommercializationP1ReleaseGate,
  COMMERCIALIZATION_P1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/commercialization.release.gate";
