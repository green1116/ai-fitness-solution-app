/**
 * V80 GTM P1 — Real customer activation types (execution spec only)
 */
import type { AutonomousGrowthReport } from "@/lib/postlaunch/v80/autonomy.types";

export const V80_GTM_ACTIVATION_VERSION = "v80-gtm-activation-1" as const;
export const V80_GTM_ACTIVATION_FREEZE_VERSION = "v80-gtm-activation-freeze-1" as const;

export type FirstCustomerTarget = {
  id: string;
  rank: number;
  segment: string;
  buyerRole: string;
  whyNow: string;
  targetPlan: "PRO" | "ENTERPRISE";
  apiEntry: string;
  postRef?: string;
  required: boolean;
};

export type InitialSalesMotion = {
  id: string;
  rank: number;
  channel: "tender" | "outbound" | "inbound";
  motion: string;
  apiRoute: string;
  priorityRationale: string;
  postRef?: string;
  required: boolean;
};

export type RevenueValidationStep = {
  id: string;
  order: number;
  milestone: "first_deal" | "pdf" | "expansion" | "case_study";
  action: string;
  apiRoute: string;
  validationProof: string;
  postRef?: string;
  required: boolean;
};

export type GtmEntryPoint = {
  id: string;
  rank: number;
  channel: string;
  apiRoute: string;
  conversionProbability: "highest" | "high" | "medium";
  executionPlay: string;
  postRef?: string;
  required: boolean;
};

export type ActivationManifest = {
  version: typeof V80_GTM_ACTIVATION_VERSION;
  autonomyVersion: string;
  firstCustomerTargets: number;
  salesMotionPriorities: number;
  validationSteps: number;
  entryPoints: number;
  activationComplete: boolean;
  summary: string;
};

export type CustomerActivationReport = {
  version: typeof V80_GTM_ACTIVATION_VERSION;
  freezeVersion: typeof V80_GTM_ACTIVATION_FREEZE_VERSION;
  reportId: string;
  autonomyReady: boolean;
  manifest: ActivationManifest;
  firstCustomerStrategy: FirstCustomerTarget[];
  initialSalesMotion: InitialSalesMotion[];
  revenueValidationLoop: RevenueValidationStep[];
  gtmEntryPoints: GtmEntryPoint[];
  autonomousGrowth: AutonomousGrowthReport;
  activationReady: boolean;
  readinessScore: number;
  summary: string;
};
