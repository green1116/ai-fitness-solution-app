/**
 * V80 PRODUCT P3 — Scale & market domination types (spec only)
 */
export const V80_PRODUCT_SCALE_VERSION = "v80-product-scale-1" as const;
export const V80_PRODUCT_SCALE_FREEZE_VERSION = "v80-product-scale-freeze-1" as const;

export type MarketDominancePillar = {
  id: string;
  pillar: "positioning" | "wedge" | "differentiation";
  headline: string;
  targetSegment: string;
  proofPoint: string;
  p2Ref?: string;
  required: boolean;
};

export type ChannelScalingModel = {
  id: string;
  channel: "inbound" | "outbound" | "partners" | "tender";
  motion: string;
  funnelStage: string;
  conversionHook: string;
  scaleLever: string;
  required: boolean;
};

export type EnterpriseReplicationModel = {
  id: string;
  replicationKey: "multi-org" | "multi-region" | "multi-brand";
  rolloutPhase: string;
  apiSurface: string;
  governanceGate: string;
  expansionRef: string;
  required: boolean;
};

export type GrowthFlywheelStage = {
  id: string;
  order: number;
  stage: "usage" | "data" | "pdf" | "workflow" | "expansion";
  input: string;
  output: string;
  compoundingEffect: string;
  apiRoute?: string;
  required: boolean;
};

export type ScaleManifest = {
  version: typeof V80_PRODUCT_SCALE_VERSION;
  growthVersion: string;
  dominancePillars: number;
  channelModels: number;
  replicationModels: number;
  flywheelStages: number;
  scaleComplete: boolean;
  summary: string;
};

export type ScaleReport = {
  version: typeof V80_PRODUCT_SCALE_VERSION;
  freezeVersion: typeof V80_PRODUCT_SCALE_FREEZE_VERSION;
  reportId: string;
  growthReady: boolean;
  manifest: ScaleManifest;
  dominance: MarketDominancePillar[];
  channels: ChannelScalingModel[];
  replication: EnterpriseReplicationModel[];
  flywheel: GrowthFlywheelStage[];
  scaleReady: boolean;
  readinessScore: number;
  summary: string;
};
