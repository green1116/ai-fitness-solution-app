/**
 * V47 Commercial Products — Phase 1.
 * Read-only product packaging over V38~V46 intelligence foundation.
 */
export * from "./shared/constants";
export * from "./shared/types";

export { buildIntelligenceSnapshot } from "./shared/intelligence-snapshot";

export { buildProductCatalog, getProductCatalogEntry, assertProductCatalogReady } from "./product-catalog/product-catalog";
export {
  buildKickstartPackage,
  buildTenderReadyPackage,
  buildDeliveryPackage,
  buildProductPackage,
} from "./product-packages/package-builder";
export { calculatePricingQuote } from "./pricing/pricing-engine";
export { getSlaDefinition, assignSla, buildSlaRegistry } from "./sla/sla-engine";
export { buildContractTemplate } from "./contracts/contract-template";
export { validateProductPackagingFoundation } from "./product-packaging-validation";
