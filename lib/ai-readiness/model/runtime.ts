import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { AI_PROVIDER_IDS } from "../provider/builders";
import { buildModelDefinitions } from "./builders";
import type { ModelRuntimePayload } from "./types";
import { MODEL_RUNTIME_VERSION } from "./types";

export function validateModelRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "model-default";
  const models = buildModelDefinitions({ deploymentId });
  const providers = new Set(models.map((m) => m.providerId));
  return {
    valid:
      models.length === AI_PROVIDER_IDS.length &&
      models.every((m) => m.contextWindow > 0 && m.capabilities.length > 0) &&
      AI_PROVIDER_IDS.every((id) => providers.has(id)),
  };
}

export function runModelRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<ModelRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "model-default";
  const stages: AiReadinessStageResult[] = [];

  const models = runStage("model-definitions", "Model Definitions", () => buildModelDefinitions({ deploymentId }), stages);
  const validation = runStage("model-validate", "Model Validation", () => validateModelRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Model runtime validation failed");

  const payload: ModelRuntimePayload = {
    version: MODEL_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    models,
    summary: `model-runtime models=${models.length} families=${[...new Set(models.map((m) => m.family))].join(",")}`,
  };

  return finalizeRuntime({ domain: "model-runtime", deploymentId, stages, payload, summary: payload.summary });
}
