/**
 * V3.7 packaging tier mapping compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export type CommercialPackagingTier = "enterprise" | "standard" | "trial";

const VALID_TIERS: readonly CommercialPackagingTier[] = [
  "enterprise",
  "standard",
  "trial",
];

export function normalizeProductTier(
  tier?: CommercialPackagingTier | string,
): CommercialPackagingTier {
  if (tier && VALID_TIERS.includes(tier as CommercialPackagingTier)) {
    return tier as CommercialPackagingTier;
  }

  return "enterprise";
}
