import type { AI_READINESS_VERSION } from "../shared/types";

export const AI_READINESS_DASHBOARD_RUNTIME_VERSION =
  "v11.5-ai-readiness-dashboard-runtime-1" as const;

export type ReadinessLevel = "not-ready" | "in-progress" | "contract-ready" | "integration-ready";

export interface ReadinessDimension {
  dimensionId: string;
  label: string;
  level: ReadinessLevel;
  score: number;
}

export interface AiReadinessDashboardRuntimePayload {
  version: typeof AI_READINESS_DASHBOARD_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  dimensions: ReadinessDimension[];
  overallScore: number;
  overallLevel: ReadinessLevel;
  summary: string;
}
