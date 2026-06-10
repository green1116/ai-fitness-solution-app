import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { AI_PROVIDER_IDS, buildAiProviderDefinitions } from "./builders";
import type { AiProviderRuntimePayload } from "./types";
import { AI_PROVIDER_RUNTIME_VERSION } from "./types";

export function validateAiProviderRuntime(): { valid: boolean } {
  const providers = buildAiProviderDefinitions();
  const ids = new Set(providers.map((p) => p.providerId));
  return {
    valid:
      providers.length === AI_PROVIDER_IDS.length &&
      AI_PROVIDER_IDS.every((id) => ids.has(id)),
  };
}

export function runAiProviderRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<AiProviderRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "ai-provider-default";
  const stages: AiReadinessStageResult[] = [];

  const providers = runStage("ai-providers", "AI Provider Definitions", () => buildAiProviderDefinitions(), stages);
  const validation = runStage("ai-provider-validate", "Provider Validation", () => validateAiProviderRuntime(), stages);
  if (!validation.valid) throw new Error("AI provider runtime validation failed");

  const payload: AiProviderRuntimePayload = {
    version: AI_PROVIDER_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    providers,
    supportedProviders: [...AI_PROVIDER_IDS],
    summary: `ai-provider-runtime providers=${providers.length} ids=${AI_PROVIDER_IDS.join(",")}`,
  };

  return finalizeRuntime({ domain: "ai-provider", deploymentId, stages, payload, summary: payload.summary });
}
