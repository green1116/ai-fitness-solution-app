export const PERFORMANCE_ENGINE_VERSION = "v46-performance-intelligence-p1" as const;
export const PI_CANONICAL_ID = "performance-intelligence" as const;
export type PerformanceIntelligenceMode = typeof PI_CANONICAL_ID;
export const PI_P1_TAG = PERFORMANCE_ENGINE_VERSION;
export const PI_P1_PHASE = 1 as const;
export const PI_FOUNDATION_TAG = "v46-performance-intelligence-foundation" as const;

export const PI_UPSTREAM_WIN_LOSS_LAYER = "v44-win-loss-intelligence-foundation" as const;
export const PI_UPSTREAM_DELIVERY_LAYER = "v45-project-delivery-intelligence-foundation" as const;

export const PERFORMANCE_STATUS = ["excellent", "good", "average", "poor"] as const;
export type PerformanceStatus = (typeof PERFORMANCE_STATUS)[number];

export const PI_MIN_PERFORMANCE_COUNT = 5 as const;
export const PI_MIN_AVERAGE_PERFORMANCE_SCORE = 60 as const;

export const PI_P2_VERSION = "v46-performance-intelligence-p2" as const;
export const PI_P2_TAG = PI_P2_VERSION;
export const PI_P2_PHASE = 2 as const;

export const PI_MIN_BRAND_BENCHMARK_COUNT = 3 as const;
export const PI_MIN_SUPPLIER_BENCHMARK_COUNT = 3 as const;
export const PI_MIN_PRODUCT_BENCHMARK_COUNT = 3 as const;
export const PI_MIN_PROJECT_BENCHMARK_COUNT = 5 as const;

export const PI_UPSTREAM_BRAND_LAYER = "v38-brand-intelligence-network-foundation" as const;
export const PI_UPSTREAM_DECISION_LAYER =
  "v42-equivalent-product-intelligence-foundation" as const;
export const PI_UPSTREAM_PROCUREMENT_LAYER =
  "v43-procurement-intelligence-foundation" as const;
