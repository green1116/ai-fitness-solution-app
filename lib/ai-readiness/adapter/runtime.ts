import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { buildAiAdapter, runAdapterTasks } from "./builders";
import type { AiAdapterRuntimePayload } from "./types";
import { AI_ADAPTER_RUNTIME_VERSION } from "./types";

const SAMPLE_INPUT = {
  deploymentId: "adapter-sample",
  projectName: "智慧健身中心设备采购与运营项目",
};

export function validateAiAdapterRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "adapter-default";
  const adapter = buildAiAdapter({ deploymentId });
  const genInput = { deploymentId, projectName: SAMPLE_INPUT.projectName };
  const proposal = adapter.generateProposal(genInput);
  const summary = adapter.generateSummary(genInput);
  const risk = adapter.generateRiskAnalysis(genInput);
  const compliance = adapter.generateComplianceMatrix(genInput);

  return {
    valid:
      proposal.mode === "readiness-stub" &&
      summary.mode === "readiness-stub" &&
      risk.mode === "readiness-stub" &&
      compliance.mode === "readiness-stub" &&
      proposal.completion.finishReason === "stop",
  };
}

export function runAiAdapterRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<AiAdapterRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "adapter-default";
  const stages: AiReadinessStageResult[] = [];

  const adapter = runStage("ai-adapter", "AI Adapter", () => buildAiAdapter({ deploymentId }), stages);
  const results = runStage(
    "ai-adapter-tasks",
    "Adapter Task Results",
    () => runAdapterTasks(adapter, { deploymentId, projectName: SAMPLE_INPUT.projectName }),
    stages,
  );
  const validation = runStage("ai-adapter-validate", "Adapter Validation", () => validateAiAdapterRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("AI adapter runtime validation failed");

  const payload: AiAdapterRuntimePayload = {
    version: AI_ADAPTER_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    adapter,
    results,
    summary: `ai-adapter-runtime tasks=${results.length} provider=${adapter.providerId} model=${adapter.modelId}`,
  };

  return finalizeRuntime({ domain: "ai-adapter", deploymentId, stages, payload, summary: payload.summary });
}
