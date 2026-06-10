import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { buildCompletionRequest, buildCompletionResponse } from "./builders";
import type { CompletionRuntimePayload } from "./types";
import { COMPLETION_RUNTIME_VERSION } from "./types";

export function validateCompletionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "completion-default";
  const request = buildCompletionRequest({ deploymentId });
  const response = buildCompletionResponse({ deploymentId, request });
  return {
    valid:
      request.mode === "readiness-stub" &&
      response.mode === "readiness-stub" &&
      response.requestId === request.requestId &&
      response.finishReason === "stop",
  };
}

export function runCompletionRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<CompletionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "completion-default";
  const stages: AiReadinessStageResult[] = [];

  const request = runStage("completion-request", "Completion Request", () => buildCompletionRequest({ deploymentId }), stages);
  const response = runStage("completion-response", "Completion Response", () => buildCompletionResponse({ deploymentId, request }), stages);
  const validation = runStage("completion-validate", "Completion Validation", () => validateCompletionRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Completion runtime validation failed");

  const payload: CompletionRuntimePayload = {
    version: COMPLETION_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    request,
    response,
    summary: `completion-runtime request=${request.requestId} finish=${response.finishReason}`,
  };

  return finalizeRuntime({ domain: "completion-runtime", deploymentId, stages, payload, summary: payload.summary });
}
