export const PI_VERSION = "v43-procurement-intelligence-p1" as const;
export const PI_CANONICAL_ID = "procurement-intelligence" as const;
export type ProcurementIntelligenceMode = typeof PI_CANONICAL_ID;
export const PI_P1_TAG = PI_VERSION;
export const PI_P1_PHASE = 1 as const;
export const PI_FOUNDATION_TAG = "v43-procurement-intelligence-foundation" as const;
export const PI_FOUNDATION_VERSION = PI_FOUNDATION_TAG;

/** Read-only upstream layer consumed by V43. */
export const PI_UPSTREAM_DECISION_LAYER =
  "v42-equivalent-product-intelligence-foundation" as const;
