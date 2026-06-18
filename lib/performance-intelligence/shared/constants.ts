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
