import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import {
  buildPromptAudit,
  buildPromptTemplates,
  buildPromptTrace,
  PROMPT_KINDS,
} from "./builders";
import type { PromptOrchestrationRuntimePayload } from "./types";
import { PROMPT_ORCHESTRATION_RUNTIME_VERSION } from "./types";

export function validatePromptOrchestrationRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const templates = buildPromptTemplates(input);
  const audit = buildPromptAudit(templates);
  return {
    valid:
      templates.length === PROMPT_KINDS.length &&
      audit.every((a) => a.checksum.length > 0),
  };
}

export function runPromptOrchestrationRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<PromptOrchestrationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "prompt-default";
  const stages: AiIntegrationStageResult[] = [];

  const templates = runStage(
    "prompt-templates",
    "Prompt Templates",
    () => buildPromptTemplates({ deploymentId }),
    stages,
  );
  const audit = runStage(
    "prompt-audit",
    "Prompt Audit",
    () => buildPromptAudit(templates),
    stages,
  );
  const trace = runStage(
    "prompt-trace",
    "Prompt Trace",
    () => buildPromptTrace({ deploymentId, templates }),
    stages,
  );
  const validation = runStage(
    "prompt-validate",
    "Prompt Validation",
    () => validatePromptOrchestrationRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Prompt orchestration validation failed");

  const payload: PromptOrchestrationRuntimePayload = {
    version: PROMPT_ORCHESTRATION_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    templates,
    audit,
    trace,
    summary: `prompt-orchestration templates=${templates.length} version=${templates[0]?.version}`,
  };

  return finalizeRuntime({
    domain: "prompt-orchestration",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
