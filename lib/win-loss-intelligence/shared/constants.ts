export const WLI_VERSION = "v44-win-loss-intelligence-p1" as const;
export const WLI_CANONICAL_ID = "win-loss-intelligence" as const;
export type WinLossIntelligenceMode = typeof WLI_CANONICAL_ID;
export const WLI_P1_TAG = WLI_VERSION;
export const WLI_P1_PHASE = 1 as const;
export const WLI_FOUNDATION_TAG = "v44-win-loss-intelligence-foundation" as const;
export const WLI_FOUNDATION_VERSION = WLI_FOUNDATION_TAG;

export const WLI_UPSTREAM_TENDER_LAYER = "v41-tender-knowledge-graph-foundation" as const;
export const WLI_UPSTREAM_DECISION_LAYER =
  "v42-equivalent-product-intelligence-foundation" as const;
export const WLI_UPSTREAM_PROCUREMENT_LAYER =
  "v43-procurement-intelligence-foundation" as const;

export const WLI_MIN_OUTCOME_COUNT = 10 as const;
export const WLI_MIN_WIN_COUNT = 3 as const;
export const WLI_MIN_LOSS_COUNT = 3 as const;
export const WLI_MIN_PENDING_COUNT = 2 as const;
