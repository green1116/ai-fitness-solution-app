import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const TENDER_DASHBOARD_RUNTIME_VERSION = "v12.0-tender-dashboard-runtime-1" as const;

export interface TenderDashboardRuntimePayload {
  version: typeof TENDER_DASHBOARD_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  intelligenceCompleteness: number;
  projectUnderstanding: number;
  riskUnderstanding: number;
  complianceUnderstanding: number;
  summary: string;
}
