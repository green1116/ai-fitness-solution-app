/**
 * V80 POST-LAUNCH P2 — Revenue optimization types (spec only)
 */
import type { RevenueActivationReport } from "./revenue.types";

export const V80_POSTLAUNCH_OPTIMIZATION_VERSION = "v80-postlaunch-optimization-1" as const;
export const V80_POSTLAUNCH_OPTIMIZATION_FREEZE_VERSION = "v80-postlaunch-optimization-freeze-1" as const;

export type ConversionRateTuning = {
  id: string;
  channel: "api" | "pdf" | "workflow";
  route: string;
  p1EntryRef: string;
  triggerRef: string;
  tuning: string;
  expectedCrLift: string;
  required: boolean;
};

export type EnterpriseSalesAcceleration = {
  id: string;
  gtmRef: string;
  cycleStage: "rfp" | "response" | "compliance" | "close";
  apiRoute: string;
  baselineDays: number;
  targetDays: number;
  accelerationTactic: string;
  deliverable: string;
  required: boolean;
};

export type PricingYieldOptimization = {
  id: string;
  metric: "arpa" | "upgrade_timing" | "usage_pressure";
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  signal: string;
  apiRoute: string;
  p1PressureRef?: string;
  optimization: string;
  yieldImpact: string;
  required: boolean;
};

export type RevenueLeakPoint = {
  id: string;
  funnelStage: "org" | "intake" | "pdf" | "budget" | "paid";
  dropSignal: string;
  leakRoute?: string;
  fixPoint: string;
  fixSurface: "api" | "pdf" | "workflow" | "cta";
  p1LoopRef?: string;
  required: boolean;
};

export type OptimizationManifest = {
  version: typeof V80_POSTLAUNCH_OPTIMIZATION_VERSION;
  revenueVersion: string;
  conversionTunings: number;
  enterpriseAccelerations: number;
  pricingYieldOpts: number;
  leakPoints: number;
  optimizationComplete: boolean;
  summary: string;
};

export type RevenueOptimizationReport = {
  version: typeof V80_POSTLAUNCH_OPTIMIZATION_VERSION;
  freezeVersion: typeof V80_POSTLAUNCH_OPTIMIZATION_FREEZE_VERSION;
  reportId: string;
  revenueReady: boolean;
  manifest: OptimizationManifest;
  conversionTuning: ConversionRateTuning[];
  enterpriseAcceleration: EnterpriseSalesAcceleration[];
  pricingYield: PricingYieldOptimization[];
  leakDetection: RevenueLeakPoint[];
  revenueActivation: RevenueActivationReport;
  optimizationReady: boolean;
  readinessScore: number;
  summary: string;
};
