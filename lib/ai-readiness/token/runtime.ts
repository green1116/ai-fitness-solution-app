import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { buildTokenUsage, buildTokenUsageSamples } from "./builders";
import type { TokenRuntimePayload } from "./types";
import { TOKEN_RUNTIME_VERSION } from "./types";

export function validateTokenRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "token-default";
  const usage = buildTokenUsage({ deploymentId });
  return {
    valid:
      usage.totalTokens === usage.promptTokens + usage.completionTokens &&
      usage.promptTokens > 0 &&
      usage.completionTokens > 0,
  };
}

export function runTokenRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<TokenRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "token-default";
  const stages: AiReadinessStageResult[] = [];

  const usage = runStage("token-usage", "Token Usage", () => buildTokenUsage({ deploymentId }), stages);
  const samples = runStage("token-samples", "Token Samples", () => buildTokenUsageSamples({ deploymentId }), stages);
  const validation = runStage("token-validate", "Token Validation", () => validateTokenRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Token runtime validation failed");

  const payload: TokenRuntimePayload = {
    version: TOKEN_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    usage,
    samples,
    summary: `token-runtime prompt=${usage.promptTokens} completion=${usage.completionTokens} total=${usage.totalTokens}`,
  };

  return finalizeRuntime({ domain: "token-runtime", deploymentId, stages, payload, summary: payload.summary });
}
