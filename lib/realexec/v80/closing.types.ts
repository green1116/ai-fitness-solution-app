/**
 * V80 REAL EXEC P2 — First deal closing types (playbook spec only)
 */
import type { FirstRevenueExecutionReport } from "@/lib/gtm/v80/execution.types";

export const V80_REALEXEC_CLOSING_VERSION = "v80-realexec-closing-1" as const;
export const V80_REALEXEC_CLOSING_FREEZE_VERSION = "v80-realexec-closing-freeze-1" as const;

export type FirstContactScript = {
  id: string;
  order: number;
  phase: "outreach" | "opening" | "hook";
  channel: "email" | "call" | "linkedin";
  script: string;
  apiHook?: string;
  gtmRef?: string;
  required: boolean;
};

export type DemoFlowStep = {
  id: string;
  order: number;
  minuteMark: string;
  durationMin: number;
  showWhat: string;
  apiRoute: string;
  buyerTakeaway: string;
  executionRef?: string;
  required: boolean;
};

export type ObjectionResponse = {
  id: string;
  category: "price" | "trust" | "timing" | "competition";
  objection: string;
  response: string;
  proofApi: string;
  required: boolean;
};

export type ClosingScriptBeat = {
  id: string;
  order: number;
  moment: "trial_close" | "offer" | "payment_ask" | "enterprise_bridge";
  script: string;
  targetPlan: "PRO" | "ENTERPRISE";
  apiRoute: string;
  revenueRef?: string;
  required: boolean;
};

export type ClosingManifest = {
  version: typeof V80_REALEXEC_CLOSING_VERSION;
  executionVersion: string;
  contactScripts: number;
  demoSteps: number;
  objectionResponses: number;
  closingBeats: number;
  closingComplete: boolean;
  summary: string;
};

export type FirstDealClosingReport = {
  version: typeof V80_REALEXEC_CLOSING_VERSION;
  freezeVersion: typeof V80_REALEXEC_CLOSING_FREEZE_VERSION;
  reportId: string;
  executionReady: boolean;
  manifest: ClosingManifest;
  firstContact: FirstContactScript[];
  demoFlow: DemoFlowStep[];
  objectionHandling: ObjectionResponse[];
  closingScript: ClosingScriptBeat[];
  revenueExecution: FirstRevenueExecutionReport;
  closingReady: boolean;
  readinessScore: number;
  summary: string;
};
