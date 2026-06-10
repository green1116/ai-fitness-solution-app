import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import {
  buildAiReadinessDimensions,
  computeOverallReadiness,
  isAdapterReady,
} from "./builders";
import type { AiReadinessDashboardRuntimePayload } from "./types";
import { AI_READINESS_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateAiReadinessDashboard(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const dimensions = buildAiReadinessDimensions({ deploymentId });
  const { overallScore } = computeOverallReadiness(dimensions);
  return {
    valid:
      dimensions.length === 5 &&
      overallScore > 0 &&
      isAdapterReady(deploymentId),
  };
}

export function runAiReadinessDashboardRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<AiReadinessDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: AiReadinessStageResult[] = [];

  const dimensions = runStage("ai-readiness-dimensions", "Readiness Dimensions", () => buildAiReadinessDimensions({ deploymentId }), stages);
  const overall = runStage("ai-readiness-overall", "Overall Readiness", () => computeOverallReadiness(dimensions), stages);
  const validation = runStage("ai-readiness-dashboard-validate", "Dashboard Validation", () => validateAiReadinessDashboard({ deploymentId }), stages);
  if (!validation.valid) throw new Error("AI readiness dashboard validation failed");

  const payload: AiReadinessDashboardRuntimePayload = {
    version: AI_READINESS_DASHBOARD_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    dimensions,
    overallScore: overall.overallScore,
    overallLevel: overall.overallLevel,
    summary: `ai-readiness-dashboard score=${overall.overallScore} level=${overall.overallLevel} dimensions=${dimensions.length}`,
  };

  return finalizeRuntime({ domain: "ai-readiness", deploymentId, stages, payload, summary: payload.summary });
}
