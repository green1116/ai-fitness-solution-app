import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import { buildAiGenerationDashboardMetrics } from "./builders";
import type { AiGenerationDashboardRuntimePayload } from "./types";
import { AI_GENERATION_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateAiGenerationDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildAiGenerationDashboardMetrics(input);
  return {
    valid:
      metrics.providerReadiness === 100 &&
      metrics.generationReadiness === 100 &&
      metrics.safetyReadiness === 100,
  };
}

export function runAiGenerationDashboardRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<AiGenerationDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: AiIntegrationStageResult[] = [];

  const metrics = runStage(
    "ai-dashboard-metrics",
    "AI Generation Dashboard Metrics",
    () => buildAiGenerationDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "ai-dashboard-validate",
    "Dashboard Validation",
    () => validateAiGenerationDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("AI generation dashboard validation failed");

  const payload: AiGenerationDashboardRuntimePayload = {
    version: AI_GENERATION_DASHBOARD_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    providerReadiness: metrics.providerReadiness,
    modelReadiness: metrics.modelReadiness,
    promptReadiness: metrics.promptReadiness,
    safetyReadiness: metrics.safetyReadiness,
    costReadiness: metrics.costReadiness,
    auditReadiness: metrics.auditReadiness,
    generationReadiness: metrics.generationReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "ai-generation-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
