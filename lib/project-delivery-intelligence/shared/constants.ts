export const PROJECT_DELIVERY_ENGINE_VERSION = "v45-project-delivery-intelligence-p1" as const;
export const PDI_CANONICAL_ID = "project-delivery-intelligence" as const;
export type ProjectDeliveryIntelligenceMode = typeof PDI_CANONICAL_ID;
export const PDI_P1_TAG = PROJECT_DELIVERY_ENGINE_VERSION;
export const PDI_P1_PHASE = 1 as const;
export const PDI_FOUNDATION_TAG = "v45-project-delivery-intelligence-foundation" as const;
export const PDI_FOUNDATION_VERSION = PDI_FOUNDATION_TAG;

export const PDI_UPSTREAM_REQUIREMENT_LAYER = "v40-requirement-intelligence-foundation" as const;
export const PDI_UPSTREAM_TENDER_LAYER = "v41-tender-knowledge-graph-foundation" as const;

export const PROJECT_STATUS = ["planned", "active", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export const MILESTONE_PHASES = [
  "design",
  "procurement",
  "installation",
  "acceptance",
] as const;
export type MilestonePhase = (typeof MILESTONE_PHASES)[number];

export const MILESTONE_STATUS = ["planned", "active", "completed"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUS)[number];

export const PDI_MIN_PROJECT_COUNT = 5 as const;
export const PDI_MIN_MILESTONE_COUNT = 20 as const;
export const PDI_MIN_TENDER_LINK_COUNT = 5 as const;
export const PDI_MIN_REQUIREMENT_LINK_COUNT = 10 as const;
