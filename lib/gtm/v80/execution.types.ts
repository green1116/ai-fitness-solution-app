/**
 * V80 GTM P2 — First revenue execution types (execution spec only)
 */
import type { CustomerActivationReport } from "./activation.types";

export const V80_GTM_EXECUTION_VERSION = "v80-gtm-execution-1" as const;
export const V80_GTM_EXECUTION_FREEZE_VERSION = "v80-gtm-execution-freeze-1" as const;

export type FirstDealExecutionStep = {
  id: string;
  order: number;
  phase: "tender" | "budget" | "pdf" | "payment" | "upgrade";
  action: string;
  apiRoute: string;
  expectedOutcome: string;
  deployRef?: string;
  gtmRef?: string;
  required: boolean;
};

export type OfferPackItem = {
  id: string;
  sku: string;
  deliverable: string;
  plan: "PRO" | "ENTERPRISE";
  priceUsd: number | "metered";
  apiSurface: string;
  includedInFirstDeal: boolean;
  required: boolean;
};

export type SalesScriptBeat = {
  id: string;
  order: number;
  stage: "open" | "demo" | "value" | "close" | "handoff";
  speaker: "ae" | "buyer" | "system";
  script: string;
  apiTrigger?: string;
  required: boolean;
};

export type RevenueCapturePoint = {
  id: string;
  order: number;
  trigger: string;
  apiRoute: string;
  usageType: string | null;
  chargeCents: number | null;
  collectionMethod: "subscription" | "metered" | "annual-contract";
  billingRef?: string;
  required: boolean;
};

export type ExecutionManifest = {
  version: typeof V80_GTM_EXECUTION_VERSION;
  activationVersion: string;
  dealSteps: number;
  offerPackItems: number;
  salesScriptBeats: number;
  revenueCapturePoints: number;
  executionComplete: boolean;
  summary: string;
};

export type FirstRevenueExecutionReport = {
  version: typeof V80_GTM_EXECUTION_VERSION;
  freezeVersion: typeof V80_GTM_EXECUTION_FREEZE_VERSION;
  reportId: string;
  activationReady: boolean;
  manifest: ExecutionManifest;
  dealExecutionFlow: FirstDealExecutionStep[];
  offerPack: OfferPackItem[];
  salesScript: SalesScriptBeat[];
  revenueCapture: RevenueCapturePoint[];
  customerActivation: CustomerActivationReport;
  executionReady: boolean;
  readinessScore: number;
  summary: string;
};
