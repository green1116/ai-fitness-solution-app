/**
 * V3.6 closure summary compat entry.
 * Type-only pass-through for product-surface-summary.ts module resolution.
 */

export const CLOSURE_SUMMARY_VERSION = "3.6-closure-1" as const;

export type CommercialClosureFoundationResult = {
  version: typeof CLOSURE_SUMMARY_VERSION;
  deploymentId: string;
  closed: boolean;
  sealed: boolean;
  archiveReadiness: { ready: boolean };
  surfaceSeal: {
    v35FreezeIntact: boolean;
    v36PublicOnly: boolean;
    noRuntimeExpansion: boolean;
  };
  summary: string;
};
