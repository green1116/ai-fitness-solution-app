/**
 * V80 POST-LAUNCH P1 — Revenue activation types (spec only)
 */
import type { ConversionTrigger } from "@/lib/product/v80/growth.types";
import type { FirstTenantLiveStep } from "@/lib/deploy/v80/cutover.types";

export const V80_POSTLAUNCH_REVENUE_VERSION = "v80-postlaunch-revenue-1" as const;
export const V80_POSTLAUNCH_REVENUE_FREEZE_VERSION = "v80-postlaunch-revenue-freeze-1" as const;

export type RevenueLoopStage = {
  id: string;
  phase: "usage" | "value" | "billing" | "upgrade";
  order: number;
  event: string;
  apiRoute: string;
  usageType: string | null;
  chargeCents: number | null;
  gateCode: "FEATURE_GATE" | "USAGE_LIMIT" | null;
  targetPlan: "PRO" | "ENTERPRISE" | null;
  ctaRef?: string;
  required: boolean;
};

export type HighConversionEntryPoint = {
  id: string;
  rank: number;
  channel: "api" | "pdf" | "workflow";
  route: string;
  hook: string;
  conversionTriggerRef: string;
  expectedLift: "high" | "medium";
  paywallMoment: string;
  required: boolean;
};

export type FirstCustomerRevenueStep = {
  id: string;
  tenantStepRef: string;
  order: number;
  revenueMoment: "activation" | "value-proof" | "usage-charge" | "upgrade-prompt" | "audit-trail";
  optimization: string;
  billingCheckpoint?: string;
  conversionRef?: string;
  required: boolean;
};

export type PricingPressurePoint = {
  id: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  pressureType: "feature_gate" | "usage_cap" | "enterprise_trigger";
  featureKey: string;
  apiRoute: string;
  limitSignal: string;
  gateCode: "FEATURE_GATE" | "USAGE_LIMIT";
  targetPlan: "PRO" | "ENTERPRISE";
  ctaRef: string;
  chargeCents?: number;
  required: boolean;
};

export type RevenueManifest = {
  version: typeof V80_POSTLAUNCH_REVENUE_VERSION;
  cutoverVersion: string;
  growthVersion: string;
  loopStages: number;
  entryPoints: number;
  firstCustomerSteps: number;
  pressurePoints: number;
  revenueActivationComplete: boolean;
  summary: string;
};

export type RevenueActivationReport = {
  version: typeof V80_POSTLAUNCH_REVENUE_VERSION;
  freezeVersion: typeof V80_POSTLAUNCH_REVENUE_FREEZE_VERSION;
  reportId: string;
  cutoverReady: boolean;
  growthReady: boolean;
  manifest: RevenueManifest;
  activationLoop: RevenueLoopStage[];
  entryPoints: HighConversionEntryPoint[];
  firstCustomerPath: FirstCustomerRevenueStep[];
  pricingPressure: PricingPressurePoint[];
  conversionTriggers: ConversionTrigger[];
  firstTenantFlow: FirstTenantLiveStep[];
  revenueReady: boolean;
  readinessScore: number;
  summary: string;
};
