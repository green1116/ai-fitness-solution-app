/**
 * V3.7 product tier matrix compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export const PRODUCT_TIER_MATRIX_VERSION = "3.7-tier-matrix-1" as const;

export type ProductTierMatrixSummary = {
  version: typeof PRODUCT_TIER_MATRIX_VERSION;
  rows: Array<{ tier: string; label: string }>;
  summary: string;
};

export function buildProductTierMatrix(): ProductTierMatrixSummary {
  return {
    version: PRODUCT_TIER_MATRIX_VERSION,
    rows: [{ tier: "enterprise", label: "Enterprise" }],
    summary: `tier-matrix=${PRODUCT_TIER_MATRIX_VERSION} rows=1`,
  };
}
