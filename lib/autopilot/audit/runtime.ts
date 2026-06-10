import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildAutopilotAuditTrail } from "./builders";
import type { AutopilotAuditRuntimePayload } from "./types";
import { AUTOPILOT_AUDIT_RUNTIME_VERSION } from "./types";

export function validateAutopilotAuditRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const records = buildAutopilotAuditTrail(input);
  return {
    valid:
      records.length === 8 &&
      records.every((r) => r.runtimeDomain.length > 0) &&
      records.some((r) => r.costUsd > 0),
  };
}

export function runAutopilotAuditRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<AutopilotAuditRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "audit-default";
  const stages: AutopilotStageResult[] = [];

  const records = runStage(
    "autopilot-audit-trail",
    "Autopilot Audit Trail",
    () => buildAutopilotAuditTrail({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "autopilot-audit-validate",
    "Audit Validation",
    () => validateAutopilotAuditRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Autopilot audit validation failed");

  const totalCostUsd = records.reduce((sum, r) => sum + r.costUsd, 0);
  const failureCount = records.filter((r) => r.outcome === "failure").length;

  const payload: AutopilotAuditRuntimePayload = {
    version: AUTOPILOT_AUDIT_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    records,
    totalCostUsd,
    failureCount,
    summary: `autopilot-audit records=${records.length} cost=$${totalCostUsd.toFixed(4)} failures=${failureCount}`,
  };

  return finalizeRuntime({
    domain: "autopilot-audit",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
