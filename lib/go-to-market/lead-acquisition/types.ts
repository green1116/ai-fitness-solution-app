import type { GO_TO_MARKET_VERSION, ReadinessStubMode } from "../shared/types";

export const LEAD_ACQUISITION_RUNTIME_VERSION = "v17.0-lead-acquisition-1" as const;

export const LEAD_STAGES = ["new", "mql", "sql", "opportunity", "converted"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_QUALITY_LEVELS = ["high", "medium", "low"] as const;
export type LeadQuality = (typeof LEAD_QUALITY_LEVELS)[number];

export interface AcquiredLead {
  leadId: string;
  source: string;
  stage: LeadStage;
  score: number;
  quality: LeadQuality;
  companyName: string;
  mode: ReadinessStubMode;
}

export interface LeadAcquisitionRuntimePayload {
  version: typeof LEAD_ACQUISITION_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  leads: AcquiredLead[];
  pipelineCount: number;
  highQualityCount: number;
  conversionTrend: "up" | "stable" | "down";
  summary: string;
}
