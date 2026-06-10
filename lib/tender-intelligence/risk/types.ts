import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const RISK_INTELLIGENCE_RUNTIME_VERSION = "v12.0-risk-intelligence-runtime-1" as const;

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskDriver {
  driverId: string;
  category: string;
  description: string;
  impact: RiskLevel;
}

export interface RiskIntelligence {
  intelligenceId: string;
  riskLevel: RiskLevel;
  drivers: RiskDriver[];
  summary: string;
}

export interface RiskIntelligenceRuntimePayload {
  version: typeof RISK_INTELLIGENCE_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  risk: RiskIntelligence;
  summary: string;
}
