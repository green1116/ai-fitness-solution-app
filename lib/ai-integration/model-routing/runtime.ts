import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import { buildRoutingRules, runRoutingScenarios } from "./builders";
import type { ModelRoutingRuntimePayload } from "./types";
import { MODEL_ROUTING_RUNTIME_VERSION } from "./types";

export function validateModelRoutingRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const rules = buildRoutingRules(input);
  const decisions = runRoutingScenarios(input?.deploymentId ?? "routing-default");
  return {
    valid: rules.length >= 4 && decisions.some((d) => d.usedFallback),
  };
}

export function runModelRoutingRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<ModelRoutingRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "routing-default";
  const stages: AiIntegrationStageResult[] = [];

  const rules = runStage(
    "model-routing-rules",
    "Routing Rules",
    () => buildRoutingRules({ deploymentId }),
    stages,
  );
  const decisions = runStage(
    "model-routing-decisions",
    "Routing Decisions",
    () => runRoutingScenarios(deploymentId),
    stages,
  );
  const validation = runStage(
    "model-routing-validate",
    "Routing Validation",
    () => validateModelRoutingRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Model routing validation failed");

  const payload: ModelRoutingRuntimePayload = {
    version: MODEL_ROUTING_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    rules,
    decisions,
    summary: `model-routing rules=${rules.length} decisions=${decisions.length} fallback=enabled`,
  };

  return finalizeRuntime({
    domain: "model-routing",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
