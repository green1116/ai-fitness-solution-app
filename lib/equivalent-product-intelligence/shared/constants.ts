export const EPI_VERSION = "v42-equivalent-product-intelligence-p1" as const;
export const EPI_CANONICAL_ID = "equivalent-product-intelligence" as const;
export type EquivalentProductIntelligenceMode = typeof EPI_CANONICAL_ID;
export const EPI_PHASE = 1 as const;
export const EPI_P1_TAG = EPI_VERSION;

export const EPI_MIN_PRODUCT_COUNT = 15 as const;
export const EPI_MIN_SPECIFICATION_COUNT = 30 as const;
export const EPI_MIN_EDGE_COUNT = 30 as const;
export const EPI_MIN_PRODUCT_SPEC_LINK_RATIO = 0.5 as const;

export const CANONICAL_EQUIVALENT_TENDER_ID = "tender-sh-commercial-gym-2025-001" as const;
