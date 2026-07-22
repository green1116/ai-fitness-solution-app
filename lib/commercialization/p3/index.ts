/**
 * Commercialization P3 — Pricing & Contract Foundation public exports
 * Isolated namespace: lib/commercialization/p3
 */

export {
  BILLING_CYCLES,
  COMMERCIAL_MODELS,
  COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_BASE,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
  COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
  CONTRACT_STATUSES,
  PRICE_BOOK_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  QUOTE_STATUSES,
  TERM_KINDS,
} from "./pricing/pricing.constants";

export type {
  BillingCycle,
  CalculatePriceInput,
  PriceBookEntry,
  PriceBookStatus,
  PriceCalculation,
  PricingManagerStatus,
  PricingReadinessCheck,
  PricingReadinessResult,
  PricingReadinessVerdict,
  PricingRegistryManifest,
  RegisterPriceBookInput,
} from "./pricing/pricing.types";

export {
  activatePriceBook,
  clearPriceBooks,
  getPriceBook,
  listPriceBooks,
  registerPriceBook,
} from "./pricing/pricing.registry";

export {
  calculatePrice,
  clearPriceCalculations,
  getPriceCalculation,
  listPriceCalculations,
} from "./pricing/pricing.calculator";

export type {
  CommercialQuote,
  ComposeQuoteInput,
  QuoteComposition,
  QuoteStatus,
  RegisterQuoteInput,
} from "./quote/quote.types";

export {
  acceptQuote,
  clearCommercialQuotes,
  getCommercialQuote,
  listCommercialQuotes,
  markQuoteComposed,
  registerQuote,
} from "./quote/quote.registry";

export {
  clearQuoteCompositions,
  composeQuote,
  getQuoteComposition,
  listQuoteCompositions,
} from "./quote/quote.composer";

export type {
  CommercialContract,
  ContractLifecycleRecord,
  ContractStatus,
  RegisterContractInput,
  TransitionContractInput,
} from "./contract/contract.types";

export {
  clearCommercialContracts,
  getCommercialContract,
  listCommercialContracts,
  registerContract,
  setContractStatus,
} from "./contract/contract.registry";

export {
  clearContractLifecycleRecords,
  getContractLifecycleRecord,
  listContractLifecycleRecords,
  transitionContract,
} from "./contract/contract.lifecycle";

export type {
  CommercialModelKind,
  CommercialModelProfile,
  CommercialTerm,
  DefineCommercialModelInput,
  DefineCommercialTermInput,
  TermKind,
} from "./commercial/commercial.types";

export {
  clearCommercialTerms,
  defineCommercialTerm,
  getCommercialTerm,
  listCommercialTerms,
} from "./commercial/commercial.terms";

export {
  clearCommercialModels,
  defineCommercialModel,
  getCommercialModel,
  listCommercialModels,
} from "./commercial/commercial.model";

export {
  assertPricingContractReadinessReady,
  evaluatePricingContractReadiness,
} from "./pricing.readiness";

export {
  clearPricingContractLayer,
  createPricingContractFoundationManager,
  getPricingRegistryManifest,
  type PricingContractFoundationManager,
  type PricingContractManagerSnapshot,
} from "./pricing.manager";

export {
  assertCommercializationP3ReleaseGatePass,
  checkCommercializationP3ReleaseGate,
  COMMERCIALIZATION_P3_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/commercialization.release.gate";
