/**
 * V64 P1 — Product config (catalog-backed, no runtime mutation)
 */
import { buildProductCatalog } from "@/lib/productization/catalog";
import type { ProductTier } from "@/lib/productization/catalog";

import type { CommercialProductConfig } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

export function buildCommercialProductConfig(input?: {
  deploymentId?: string;
}): CommercialProductConfig {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  const catalog = buildProductCatalog({ deploymentId });
  return {
    version: V64_COMMERCIAL_FOUNDATION_VERSION,
    configId: `product-config-${deploymentId}`,
    productName: catalog.productName,
    catalog,
    tiers: [...ALL_TIERS],
    summary: `product-config name=${catalog.productName} tiers=${catalog.totalTiers}`,
  };
}
