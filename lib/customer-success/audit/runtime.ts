import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildSuccessAuditTrail } from "./builders";
import type { SuccessAuditRuntimePayload } from "./types";
import { SUCCESS_AUDIT_RUNTIME_VERSION } from "./types";

export function validateSuccessAuditRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const records = buildSuccessAuditTrail(input);
  return {
    valid:
      records.length >= 4 &&
      records.some((r) => r.actor === "customer") &&
      records.some((r) => r.actor === "success-team"),
  };
}

export function runSuccessAuditRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<SuccessAuditRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "audit-default";
  const stages: CustomerSuccessStageResult[] = [];

  const records = runStage("success-audit-trail", "Success Audit Trail", () => buildSuccessAuditTrail({ deploymentId }), stages);
  const validation = runStage("success-audit-validate", "Audit Validation", () => validateSuccessAuditRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Success audit validation failed");

  const payload: SuccessAuditRuntimePayload = {
    version: SUCCESS_AUDIT_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    records,
    customerActionCount: records.filter((r) => r.actor === "customer").length,
    successActionCount: records.filter((r) => r.actor === "success-team").length,
    successOutcomeCount: records.filter((r) => r.outcome === "success").length,
    summary: `success-audit records=${records.length} customerActions=${records.filter((r) => r.actor === "customer").length} successActions=${records.filter((r) => r.actor === "success-team").length}`,
  };

  return finalizeRuntime({ domain: "success-audit", deploymentId, stages, payload, summary: payload.summary });
}
