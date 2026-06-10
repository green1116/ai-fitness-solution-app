import { validateAiAdapterRuntime } from "../adapter/runtime";
import { validateAiProviderRuntime } from "../provider/runtime";
import { validateCostRuntime } from "../cost/runtime";
import { validateModelRuntime } from "../model/runtime";
import { validatePromptRuntime } from "../prompt/runtime";
import { validateTokenRuntime } from "../token/runtime";
import type { ReadinessDimension, ReadinessLevel } from "./types";

function scoreToLevel(score: number): ReadinessLevel {
  if (score >= 90) return "integration-ready";
  if (score >= 75) return "contract-ready";
  if (score >= 50) return "in-progress";
  return "not-ready";
}

export function buildAiReadinessDimensions(input?: {
  deploymentId?: string;
}): ReadinessDimension[] {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const checks = [
    { label: "Provider Readiness", valid: validateAiProviderRuntime().valid, score: 88 },
    { label: "Model Readiness", valid: validateModelRuntime({ deploymentId }).valid, score: 85 },
    { label: "Prompt Readiness", valid: validatePromptRuntime({ deploymentId }).valid, score: 82 },
    { label: "Token Readiness", valid: validateTokenRuntime({ deploymentId }).valid, score: 80 },
    { label: "Cost Readiness", valid: validateCostRuntime({ deploymentId }).valid, score: 78 },
  ];

  return checks.map((check, index) => ({
    dimensionId: `ai-readiness-${index}-${deploymentId}`,
    label: check.label,
    level: check.valid ? scoreToLevel(check.score) : "not-ready",
    score: check.valid ? check.score : 0,
  }));
}

export function computeOverallReadiness(dimensions: ReadinessDimension[]): {
  overallScore: number;
  overallLevel: ReadinessLevel;
} {
  const overallScore = Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length,
  );
  return { overallScore, overallLevel: scoreToLevel(overallScore) };
}

export function isAdapterReady(deploymentId: string): boolean {
  return validateAiAdapterRuntime({ deploymentId }).valid;
}
