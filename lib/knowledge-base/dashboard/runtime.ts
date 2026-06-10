import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  KnowledgeBaseRuntimeResult,
  KnowledgeBaseStageResult,
} from "../shared/types";
import { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import { buildKnowledgeDashboardMetrics } from "./builders";
import type { KnowledgeDashboardRuntimePayload } from "./types";
import { KNOWLEDGE_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateKnowledgeDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildKnowledgeDashboardMetrics(input);
  return {
    valid:
      metrics.knowledgeCompleteness === 100 &&
      metrics.categoryCoverage === 100 &&
      metrics.searchReadiness === 100,
  };
}

export function runKnowledgeDashboardRuntime(input?: {
  deploymentId?: string;
}): KnowledgeBaseRuntimeResult<KnowledgeDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: KnowledgeBaseStageResult[] = [];

  const metrics = runStage(
    "knowledge-dashboard-metrics",
    "Knowledge Dashboard Metrics",
    () => buildKnowledgeDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "knowledge-dashboard-validate",
    "Dashboard Validation",
    () => validateKnowledgeDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Knowledge dashboard validation failed");

  const payload: KnowledgeDashboardRuntimePayload = {
    version: KNOWLEDGE_DASHBOARD_RUNTIME_VERSION,
    knowledgeVersion: KNOWLEDGE_BASE_VERSION,
    knowledgeCompleteness: metrics.knowledgeCompleteness,
    knowledgeCoverage: metrics.knowledgeCoverage,
    categoryCoverage: metrics.categoryCoverage,
    searchReadiness: metrics.searchReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "knowledge-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
