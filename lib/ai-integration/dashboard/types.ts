import type { AI_INTEGRATION_VERSION } from "../shared/types";

export const AI_GENERATION_DASHBOARD_RUNTIME_VERSION = "v13.0-ai-generation-dashboard-1" as const;

export interface AiGenerationDashboardRuntimePayload {
  version: typeof AI_GENERATION_DASHBOARD_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  providerReadiness: number;
  modelReadiness: number;
  promptReadiness: number;
  safetyReadiness: number;
  costReadiness: number;
  auditReadiness: number;
  generationReadiness: number;
  summary: string;
}
