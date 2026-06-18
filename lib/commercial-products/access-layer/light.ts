/**
 * V47 access-layer light surface — safe for quote/catalog API routes at build time.
 * Does not import PDF renderers or intelligence-heavy PDF chains.
 */
export { createQuote } from "./quote/quote-service";
export { runQuoteRuntime, getQuoteRuntimeMeta } from "./quote/quote-runtime";
export { checkProductEligibility, validateCommercialQuote } from "./validation/sales-access-validation";
export { buildSalesPortalView } from "./portal/portal-builder";
export { buildSalesPortalRegistry } from "./portal/portal-registry";

export { buildProductCatalog, getProductCatalogEntry } from "@/lib/commercial-products/product-catalog/product-catalog";

export * from "./shared/constants";
export * from "./shared/types";
