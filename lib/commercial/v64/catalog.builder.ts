/**
 * V64 P5 — Commercial product catalog builder
 */
import { buildProductPlan } from "@/lib/productization/catalog";
import { buildPackagingProfile } from "@/lib/productization/catalog";
import type { ProductTier } from "@/lib/productization/catalog";

import { buildCommercialCapabilitySnapshot } from "./capability.snapshot";
import { PRODUCT_TO_SAAS_PLAN } from "./capability.map";
import { buildCommercialProductConfig } from "./product.config";
import { buildCommercialFeatureMatrixSnapshot } from "./feature.snapshot";
import { getPlanRegistryEntry } from "./plan.registry";
import { normalizePlanPrice } from "./pricing.normalize";
import { buildCommercialPricingSnapshot } from "./pricing.snapshot";
import type { CommercialProductCatalogBundle, TierCatalogEntry } from "./catalog.types";
import { V64_CATALOG_LAYER_VERSION } from "./catalog.types";
import { lookupCommercialCapabilityByProductTier } from "./capability.lookup";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

function buildTierCatalogEntry(productTier: ProductTier, deploymentId: string): TierCatalogEntry {
  const saasPlan = PRODUCT_TO_SAAS_PLAN[productTier];
  return {
    productTier,
    saasPlan,
    product: buildProductPlan(productTier),
    plan: getPlanRegistryEntry(productTier),
    normalizedPrice: normalizePlanPrice(productTier),
    capability: lookupCommercialCapabilityByProductTier(productTier),
    packagingProfile: buildPackagingProfile(productTier, { deploymentId }),
  };
}

export function buildCommercialProductCatalogBundle(input?: {
  deploymentId?: string;
}): CommercialProductCatalogBundle {
  const deploymentId = input?.deploymentId ?? "v64-catalog-layer-default";
  const productConfig = buildCommercialProductConfig({ deploymentId });
  const tierEntries = ALL_TIERS.map((tier) => buildTierCatalogEntry(tier, deploymentId));
  const pricingSnapshot = buildCommercialPricingSnapshot({ deploymentId });
  const featureSnapshot = buildCommercialFeatureMatrixSnapshot({ deploymentId });
  const capabilitySnapshot = buildCommercialCapabilitySnapshot({ deploymentId });

  return {
    version: V64_CATALOG_LAYER_VERSION,
    catalogId: `commercial-product-catalog-${deploymentId}`,
    productName: productConfig.productName,
    tierEntries,
    pricingSnapshot,
    featureSnapshot,
    capabilitySnapshot,
    summary: [
      `commercial-product-catalog name=${productConfig.productName}`,
      `tiers=${tierEntries.length}`,
    ].join(" "),
  };
}

export function buildAllTierCatalogEntries(input?: {
  deploymentId?: string;
}): TierCatalogEntry[] {
  const deploymentId = input?.deploymentId ?? "v64-catalog-layer-default";
  return ALL_TIERS.map((tier) => buildTierCatalogEntry(tier, deploymentId));
}
