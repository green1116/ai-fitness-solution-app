/**
 * V3.7 capability bundle compat entry.
 * Minimal pass-through for product-surface-summary.ts module resolution.
 */

export const CAPABILITY_BUNDLE_VERSION = "3.7-capability-bundle-1" as const;

export type CapabilityBundlesSummary = {
  version: typeof CAPABILITY_BUNDLE_VERSION;
  bundles: Array<{ id: string; tier: string }>;
  summary: string;
};

export function buildCapabilityBundles(tier?: string): CapabilityBundlesSummary {
  const resolvedTier = tier ?? "enterprise";

  return {
    version: CAPABILITY_BUNDLE_VERSION,
    bundles: [{ id: "core-capabilities", tier: resolvedTier }],
    summary: `capability-bundles=${CAPABILITY_BUNDLE_VERSION} tier=${resolvedTier} count=1`,
  };
}
