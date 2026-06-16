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

export const EPI_P2_VERSION = "v42-equivalent-product-intelligence-p2" as const;
export const EPI_P2_TAG = EPI_P2_VERSION;
export const EPI_P2_PHASE = 2 as const;

export const EPI_P2_MIN_EQUIVALENT_EDGE_COUNT = 40 as const;
export const EPI_P2_MIN_AVG_MAPPING_PER_PRODUCT = 2 as const;
export const EPI_P2_MIN_CROSS_BRAND_COVERAGE = 0.3 as const;
export const EPI_P2_MIN_MAPPING_SCORE = 28 as const;
export const EPI_P2_TRAVERSAL_SCORE_THRESHOLD = 40 as const;
export const EPI_P2_TRAVERSAL_MAX_HOPS = 2 as const;

export const CANONICAL_EQUIVALENT_PRODUCT_ID = "epi-product-real-lf-t5-001" as const;
