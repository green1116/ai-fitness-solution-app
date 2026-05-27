/**
 * V3.7 entitlement model compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export const ENTITLEMENT_MODEL_VERSION = "3.7-entitlement-model-1" as const;

export type EntitlementModelSummary = {
  version: typeof ENTITLEMENT_MODEL_VERSION;
  sample: { grants: Array<{ id: string }> };
  summary: string;
};

export function buildEntitlementModel(tier?: string): EntitlementModelSummary {
  const resolvedTier = tier ?? "enterprise";

  return {
    version: ENTITLEMENT_MODEL_VERSION,
    sample: { grants: [{ id: `grant-${resolvedTier}` }] },
    summary: `entitlement-model=${ENTITLEMENT_MODEL_VERSION} tier=${resolvedTier} grants=1`,
  };
}
