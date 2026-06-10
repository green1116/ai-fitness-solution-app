import type { KNOWLEDGE_BASE_VERSION } from "../shared/types";

export const KNOWLEDGE_DASHBOARD_RUNTIME_VERSION = "v12.5-knowledge-dashboard-1" as const;

export interface KnowledgeDashboardRuntimePayload {
  version: typeof KNOWLEDGE_DASHBOARD_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  knowledgeCompleteness: number;
  knowledgeCoverage: number;
  categoryCoverage: number;
  searchReadiness: number;
  summary: string;
}
