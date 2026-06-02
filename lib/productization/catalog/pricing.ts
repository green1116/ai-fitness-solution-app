import type { PricingEntry, PricingMatrix, ProductTier } from "./types";
import { PRODUCT_PACKAGING_VERSION } from "./types";

const PRICING_ENTRIES: readonly PricingEntry[] = [
  {
    tier: "starter",
    model: "custom",
    label: "Starter",
    displayPrice: "Custom pricing",
    note: "Contact sales for Starter tier pricing.",
  },
  {
    tier: "professional",
    model: "custom",
    label: "Professional",
    displayPrice: "Custom pricing",
    note: "Contact sales for Professional tier pricing.",
  },
  {
    tier: "enterprise",
    model: "custom",
    label: "Enterprise",
    displayPrice: "Custom pricing",
    note: "Contact sales for Enterprise tier pricing.",
  },
];

export function buildPricingMatrix(input?: { deploymentId?: string }): PricingMatrix {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  return {
    version: PRODUCT_PACKAGING_VERSION,
    matrixId: `pricing-matrix-${deploymentId}`,
    entries: [...PRICING_ENTRIES],
    summary: `pricing-matrix tiers=${PRICING_ENTRIES.length} model=custom`,
  };
}

export function getPricingForTier(tier: ProductTier): PricingEntry {
  const entry = PRICING_ENTRIES.find((e) => e.tier === tier);
  if (!entry) {
    throw new Error(`Unknown pricing tier: ${tier}`);
  }
  return entry;
}
