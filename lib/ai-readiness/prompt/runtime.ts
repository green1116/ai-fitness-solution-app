import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { buildPromptTemplates } from "./builders";
import type { PromptRuntimePayload } from "./types";
import { PROMPT_KINDS, PROMPT_RUNTIME_VERSION } from "./types";

export function validatePromptRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "prompt-default";
  const templates = buildPromptTemplates({ deploymentId });
  const kinds = new Set(templates.map((t) => t.kind));
  return {
    valid:
      templates.length === PROMPT_KINDS.length &&
      PROMPT_KINDS.every((kind) => kinds.has(kind)),
  };
}

export function runPromptRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<PromptRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "prompt-default";
  const stages: AiReadinessStageResult[] = [];

  const templates = runStage("prompt-templates", "Prompt Templates", () => buildPromptTemplates({ deploymentId }), stages);
  const validation = runStage("prompt-validate", "Prompt Validation", () => validatePromptRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Prompt runtime validation failed");

  const payload: PromptRuntimePayload = {
    version: PROMPT_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    templates,
    summary: `prompt-runtime templates=${templates.length} kinds=${PROMPT_KINDS.join(",")}`,
  };

  return finalizeRuntime({ domain: "prompt-runtime", deploymentId, stages, payload, summary: payload.summary });
}
