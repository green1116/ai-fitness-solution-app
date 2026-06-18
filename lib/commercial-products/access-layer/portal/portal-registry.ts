import { buildProductCatalog } from "@/lib/commercial-products/product-catalog/product-catalog";
import {
  CP_ACCESS_CANONICAL_ID,
  CP_DOWNLOAD_API_PATH,
  CP_QUOTE_API_PATH,
} from "../shared/constants";
import type { SalesPortalProductCard, SalesPortalRegistry } from "../shared/types";

let cachedRegistry: SalesPortalRegistry | undefined;

export function buildSalesPortalRegistry(): SalesPortalRegistry {
  if (cachedRegistry) return cachedRegistry;

  const catalog = buildProductCatalog();
  const records: SalesPortalProductCard[] = catalog.records.map((entry) => ({
    sku: entry.sku,
    name: entry.name,
    description: entry.description,
    priceMinCny: entry.priceMinCny,
    priceMaxCny: entry.priceMaxCny,
    deliverableCount: entry.deliverables.length,
    defaultSla: entry.slaTier,
  }));

  cachedRegistry = {
    registryId: "cp-sales-portal-registry-v47-p2-s2",
    records,
    count: records.length,
    mode: CP_ACCESS_CANONICAL_ID,
  };

  return cachedRegistry;
}

export function getSalesPortalProductCard(sku: SalesPortalProductCard["sku"]): SalesPortalProductCard {
  const record = buildSalesPortalRegistry().records.find((item) => item.sku === sku);
  if (!record) {
    throw new Error(`Unknown portal product SKU: ${sku}`);
  }
  return record;
}

export function getSalesPortalApiPaths() {
  return {
    quoteApiPath: CP_QUOTE_API_PATH,
    downloadApiPath: CP_DOWNLOAD_API_PATH,
  };
}
