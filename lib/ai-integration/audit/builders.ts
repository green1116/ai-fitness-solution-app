import { PROMPT_VERSION } from "../prompt-orchestration/builders";
import type { AiGenerationResponse } from "../shared/types";
import type { AiAuditRecord } from "./types";

const auditStore: AiAuditRecord[] = [];

export function recordAiAudit(input: {
  deploymentId: string;
  response: AiGenerationResponse;
  outputType: string;
  promptVersion?: string;
}): AiAuditRecord {
  const record: AiAuditRecord = {
    recordId: `audit-${input.deploymentId}-${Date.now()}`,
    provider: input.response.providerId,
    model: input.response.modelId,
    promptVersion: input.promptVersion ?? PROMPT_VERSION,
    outputType: input.outputType,
    tokenCostUsd: input.response.tokenUsage.estimatedCostUsd,
    requestTimeMs: input.response.latencyMs,
    outcome: input.response.success ? "success" : "failure",
    deploymentId: input.deploymentId,
    tracedAt: new Date().toISOString(),
  };
  auditStore.push(record);
  return record;
}

export function buildAuditTrail(input: {
  deploymentId: string;
  responses: AiGenerationResponse[];
  outputTypes: string[];
}): AiAuditRecord[] {
  return input.responses.map((response, index) =>
    recordAiAudit({
      deploymentId: input.deploymentId,
      response,
      outputType: input.outputTypes[index] ?? "text",
    }),
  );
}

export function getAuditStoreSnapshot(): AiAuditRecord[] {
  return [...auditStore];
}
