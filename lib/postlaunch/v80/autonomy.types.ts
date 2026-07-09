/**
 * V80 POST-LAUNCH P4 — Autonomous growth types (spec only)
 */
import type { RevenueScalingReport } from "./scaling.types";

export const V80_POSTLAUNCH_AUTONOMY_VERSION = "v80-postlaunch-autonomy-1" as const;
export const V80_POSTLAUNCH_AUTONOMY_FREEZE_VERSION = "v80-postlaunch-autonomy-freeze-1" as const;

export type AutonomousLeadSignal = {
  id: string;
  order: number;
  signal: string;
  apiRoute: string;
  p3Ref?: string;
  autonomousAction: string;
  humanRequired: false;
  required: boolean;
};

export type SelfGeneratingSalesStep = {
  id: string;
  order: number;
  motion: "pdf" | "proposal" | "followup" | "close";
  trigger: string;
  apiRoute: string;
  p3Ref?: string;
  autonomousAction: string;
  required: boolean;
};

export type AutonomousExpansionRule = {
  id: string;
  order: number;
  signal: string;
  apiRoute: string;
  expansionTarget: "PRO" | "ENTERPRISE" | "multi-org";
  p3Ref?: string;
  autonomousAction: string;
  required: boolean;
};

export type ClosedLoopFlywheelStage = {
  id: string;
  order: number;
  phase: "data" | "pdf" | "revenue" | "reinvest" | "leads";
  input: string;
  output: string;
  apiRoute: string;
  p3Ref?: string;
  loopClosure: string;
  required: boolean;
};

export type AutonomyManifest = {
  version: typeof V80_POSTLAUNCH_AUTONOMY_VERSION;
  scalingVersion: string;
  leadSignals: number;
  salesMotionSteps: number;
  expansionRules: number;
  flywheelStages: number;
  autonomyComplete: boolean;
  summary: string;
};

export type AutonomousGrowthReport = {
  version: typeof V80_POSTLAUNCH_AUTONOMY_VERSION;
  freezeVersion: typeof V80_POSTLAUNCH_AUTONOMY_FREEZE_VERSION;
  reportId: string;
  scalingReady: boolean;
  manifest: AutonomyManifest;
  leadGeneration: AutonomousLeadSignal[];
  salesMotion: SelfGeneratingSalesStep[];
  expansionEngine: AutonomousExpansionRule[];
  growthFlywheel: ClosedLoopFlywheelStage[];
  revenueScaling: RevenueScalingReport;
  autonomyReady: boolean;
  readinessScore: number;
  summary: string;
};
