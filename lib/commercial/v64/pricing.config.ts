/**
 * V64 P1 — Pricing config (catalog + display reference; does not change checkout)
 */
import { buildPricingMatrix, getPricingForTier } from "@/lib/productization/catalog";
import { PRICING_TIERS } from "@/lib/growth/conversion/pricing.strategy";
import type { ProductTier } from "@/lib/productization/catalog";

import { PRODUCT_TO_SAAS_PLAN } from "./capability.map";
import type { CommercialPricingConfig, CommercialPricingEntry } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

function buildPricingEntry(tier: ProductTier): CommercialPricingEntry {
  const saasPlan = PRODUCT_TO_SAAS_PLAN[tier];
  const catalog = getPricingForTier(tier);
  const display = PRICING_TIERS[saasPlan];
  return {
    productTier: tier,
    saasPlan,
    catalogLabel: catalog.label,
    catalogDisplayPrice: catalog.displayPrice,
    monthlyPriceCny: display.monthlyPriceCny,
    billingNote: catalog.note,
  };
}

export function buildCommercialPricingConfig(input?: {
  deploymentId?: string;
}): CommercialPricingConfig {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  const matrix = buildPricingMatrix({ deploymentId });
  const entries = ALL_TIERS.map(buildPricingEntry);
  return {
    version: V64_COMMERCIAL_FOUNDATION_VERSION,
    configId: `pricing-config-${deploymentId}`,
    model: matrix.entries.every((e) => e.model === "custom") ? "custom" : "subscription",
    entries,
    summary: `pricing-config tiers=${entries.length} model=custom+display-ref`,
  };
}
