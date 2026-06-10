import { finalizeRuntime, runStage } from "../shared/runtime";
import { resolveAiIntegrationMode } from "../shared/mode";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import { AI_PROVIDER_IDS, runAdapterSmokeTests } from "./builders";
import type { AiProviderAdapterRuntimePayload } from "./types";
import { AI_PROVIDER_ADAPTER_RUNTIME_VERSION } from "./types";

export function validateAiProviderAdapterRuntime(input?: {
  deploymentId?: string;
  forceMode?: "stub" | "real";
}): { valid: boolean } {
  const results = runAdapterSmokeTests({
    deploymentId: input?.deploymentId ?? "adapter-default",
    forceMode: input?.forceMode ?? "stub",
  });
  return {
    valid: results.length === 5 && results.every((r) => r.success),
  };
}

export function runAiProviderAdapterRuntime(input?: {
  deploymentId?: string;
  forceMode?: "stub" | "real";
}): AiIntegrationRuntimeResult<AiProviderAdapterRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "adapter-default";
  const forceMode = input?.forceMode ?? "stub";
  const stages: AiIntegrationStageResult[] = [];

  const adapterResults = runStage(
    "provider-adapter-smoke",
    "Provider Adapter Smoke Tests",
    () => runAdapterSmokeTests({ deploymentId, forceMode }),
    stages,
  );
  const validation = runStage(
    "provider-adapter-validate",
    "Adapter Validation",
    () => validateAiProviderAdapterRuntime({ deploymentId, forceMode }),
    stages,
  );
  if (!validation.valid) throw new Error("AI provider adapter validation failed");

  const mode = resolveAiIntegrationMode({ forceMode });
  const payload: AiProviderAdapterRuntimePayload = {
    version: AI_PROVIDER_ADAPTER_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    supportedProviders: [...AI_PROVIDER_IDS],
    adapterResults,
    mode,
    summary: `ai-provider-adapter providers=${AI_PROVIDER_IDS.length} mode=${mode} methods=5`,
  };

  return finalizeRuntime({
    domain: "ai-provider-adapter",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
