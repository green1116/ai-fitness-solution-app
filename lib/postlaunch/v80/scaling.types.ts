/**
 * V80 POST-LAUNCH P3 — Revenue scaling types (spec only)
 */
import type { RevenueOptimizationReport } from "./optimization.types";

export const V80_POSTLAUNCH_SCALING_VERSION = "v80-postlaunch-scaling-1" as const;
export const V80_POSTLAUNCH_SCALING_FREEZE_VERSION = "v80-postlaunch-scaling-freeze-1" as const;

export type RevenueCompoundingLoop = {
  id: string;
  cycle: number;
  phase: "usage" | "value" | "expansion" | "reinvest";
  input: string;
  output: string;
  apiRoute: string;
  p1LoopRef?: string;
  flywheelRef?: string;
  compoundingMultiplier: string;
  required: boolean;
};

export type ChannelScalingSystem = {
  id: string;
  channel: "inbound" | "outbound" | "tender" | "partner";
  motion: string;
  apiEntry: string;
  productChannelRef: string;
  scaleLever: string;
  automationLevel: "self-serve" | "semi-auto" | "sales-assist";
  required: boolean;
};

export type SalesAutomationStep = {
  id: string;
  order: number;
  stage: "lead_score" | "qualify" | "pdf" | "proposal" | "close";
  trigger: string;
  apiRoute: string;
  automationAction: string;
  p2Ref?: string;
  required: boolean;
};

export type EnterpriseExpansionModel = {
  id: string;
  dimension: "multi-org" | "multi-region" | "account-growth";
  phase: string;
  apiSurface: string;
  replicationRef: string;
  growthMetric: string;
  required: boolean;
};

export type ScalingManifest = {
  version: typeof V80_POSTLAUNCH_SCALING_VERSION;
  optimizationVersion: string;
  compoundingLoops: number;
  channelSystems: number;
  salesAutomationSteps: number;
  enterpriseExpansions: number;
  scalingComplete: boolean;
  summary: string;
};

export type RevenueScalingReport = {
  version: typeof V80_POSTLAUNCH_SCALING_VERSION;
  freezeVersion: typeof V80_POSTLAUNCH_SCALING_FREEZE_VERSION;
  reportId: string;
  optimizationReady: boolean;
  manifest: ScalingManifest;
  compoundingLoops: RevenueCompoundingLoop[];
  channelScaling: ChannelScalingSystem[];
  salesAutomation: SalesAutomationStep[];
  enterpriseExpansion: EnterpriseExpansionModel[];
  revenueOptimization: RevenueOptimizationReport;
  scalingReady: boolean;
  readinessScore: number;
  summary: string;
};
