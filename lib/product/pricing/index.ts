/**
 * Product Pricing — Pricing Management public exports
 * Isolated namespace: lib/product/pricing
 */

export {
  DISCOUNT_KINDS,
  PRICE_MODELS,
  PRICING_CATALOG_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  PRODUCT_PRICING_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_BASE,
  PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_ID,
  PRODUCT_PRICING_MANAGEMENT_VERSION,
  QUOTE_STATUSES,
} from "./management/management.constants";

export type {
  PricingManagerStatus,
  PricingReadinessCheck,
  PricingReadinessResult,
  PricingReadinessVerdict,
  PricingRegistryManifest,
} from "./management/management.types";

export type {
  ArchiveCatalogInput,
  CatalogMetadata,
  CreateCatalogInput,
  PricingCatalog,
  PricingCatalogStatus,
  PublishCatalogInput,
} from "./catalog/catalog.types";

export {
  archiveCatalog,
  clearCatalogs,
  createCatalog,
  getCatalog,
  listCatalogs,
  publishCatalog,
} from "./catalog/catalog.registry";

export type {
  PlanPrice,
  PriceMetadata,
  PriceModel,
  RegisterPriceInput,
} from "./price/price.types";

export {
  clearPrices,
  getPrice,
  listPrices,
  registerPrice,
} from "./price/price.registry";

export type {
  DiscountKind,
  DiscountMetadata,
  PricingDiscount,
  RegisterDiscountInput,
} from "./discount/discount.types";

export {
  clearDiscounts,
  getDiscount,
  listDiscounts,
  registerDiscount,
} from "./discount/discount.registry";

export type {
  AcceptQuoteInput,
  CreateQuoteInput,
  PricingQuote,
  QuoteMetadata,
  QuoteStatus,
} from "./quote/quote.types";

export {
  acceptQuote,
  clearQuotes,
  createQuote,
  getQuote,
  listQuotes,
} from "./quote/quote.registry";

export {
  assertPricingManagementReadinessReady,
  evaluatePricingManagementReadiness,
} from "./management/management.readiness";

export {
  clearPricingManagementLayer,
  createPricingManager,
  getPricingRegistryManifest,
  type PricingManager,
  type PricingManagerSnapshot,
} from "./pricing.manager";

export {
  assertProductPricingReleaseGatePass,
  checkProductPricingReleaseGate,
  PRODUCT_PRICING_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
