import type { REVENUE_FOUNDATION_VERSION } from "../shared/types";

export const TRIAL_RUNTIME_VERSION = "v10.0-trial-runtime-1" as const;

export type TrialPlanTier = "pro-preview";

export type TrialStatus = "active" | "expiring" | "expired" | "converted";

export interface TrialPlan {
  planId: string;
  tier: TrialPlanTier;
  name: string;
  durationDays: number;
  description: string;
}

export interface TrialLimits {
  limitsId: string;
  planGeneration: number;
  budgetGeneration: number;
  proposalPdf: number;
  enterpriseZip: number;
  workspaceLimit: number;
  userLimit: number;
}

export interface TrialExpiration {
  expirationId: string;
  startedAt: string;
  expiresAt: string;
  daysRemaining: number;
  isExpired: boolean;
  status: TrialStatus;
}

export type TrialConversionTarget = "pro-monthly" | "pro-annual" | "enterprise";

export interface TrialConversion {
  conversionId: string;
  eligible: boolean;
  target: TrialConversionTarget;
  incentive: string;
  nextStep: string;
}

export interface TrialRuntimePayload {
  version: typeof TRIAL_RUNTIME_VERSION;
  foundationVersion: typeof REVENUE_FOUNDATION_VERSION;
  plan: TrialPlan;
  limits: TrialLimits;
  expiration: TrialExpiration;
  conversion: TrialConversion;
  summary: string;
}
