import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import { runAdapterSmokeTests } from "../provider-adapter/builders";
import { buildAuditTrail } from "./builders";
import type { AiAuditRuntimePayload } from "./types";
import { AI_AUDIT_RUNTIME_VERSION } from "./types";

const OUTPUT_TYPES = ["text", "structured", "proposal", "compliance", "risk"];

export function validateAiAuditRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "audit-default";
  const responses = runAdapterSmokeTests({ deploymentId, forceMode: "stub" });
  const records = buildAuditTrail({ deploymentId, responses, outputTypes: OUTPUT_TYPES });
  return {
    valid:
      records.length === 5 &&
      records.every((r) => r.provider.length > 0 && r.promptVersion.length > 0),
  };
}

export function runAiAuditRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<AiAuditRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "audit-default";
  const stages: AiIntegrationStageResult[] = [];

  const responses = runStage(
    "audit-sample-requests",
    "Sample AI Requests",
    () => runAdapterSmokeTests({ deploymentId, forceMode: "stub" }),
    stages,
  );
  const records = runStage(
    "audit-trail",
    "Audit Trail",
    () => buildAuditTrail({ deploymentId, responses, outputTypes: OUTPUT_TYPES }),
    stages,
  );
  const validation = runStage(
    "audit-validate",
    "Audit Validation",
    () => validateAiAuditRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("AI audit validation failed");

  const payload: AiAuditRuntimePayload = {
    version: AI_AUDIT_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    records,
    recordCount: records.length,
    summary: `ai-audit records=${records.length} success=${records.filter((r) => r.outcome === "success").length}`,
  };

  return finalizeRuntime({
    domain: "ai-audit",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
