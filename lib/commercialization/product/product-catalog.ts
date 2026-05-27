/**
 * V3.7 product catalog compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export const PRODUCT_CATALOG_VERSION = "3.7-product-catalog-1" as const;

export type ProductCatalogSummary = {
  version: typeof PRODUCT_CATALOG_VERSION;
  entries: Array<{ id: string; name: string }>;
  summary: string;
};

export function buildProductCatalog(): ProductCatalogSummary {
  return {
    version: PRODUCT_CATALOG_VERSION,
    entries: [{ id: "sku-enterprise", name: "Enterprise SKU" }],
    summary: `product-catalog=${PRODUCT_CATALOG_VERSION} entries=1`,
  };
}
