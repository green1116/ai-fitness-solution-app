import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildLeads } from "./builders";
import type { LeadRuntimePayload } from "./types";
import { LEAD_RUNTIME_VERSION } from "./types";

export function validateLeadRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const leads = buildLeads(input);
  return { valid: leads.length >= 3 && leads.every((l) => l.score >= 0 && l.score <= 100) };
}

export function runLeadRuntime(input?: { deploymentId?: string }): RevOpsRuntimeResult<LeadRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "lead-default";
  const stages: RevOpsStageResult[] = [];

  const leads = runStage("lead-build", "Lead Records", () => buildLeads({ deploymentId }), stages);
  const validation = runStage("lead-validate", "Lead Validation", () => validateLeadRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Lead runtime validation failed");

  const payload: LeadRuntimePayload = {
    version: LEAD_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    leads,
    leadCount: leads.length,
    summary: `lead-runtime count=${leads.length} qualified=${leads.filter((l) => l.status === "qualified").length}`,
  };

  return finalizeRuntime({ domain: "lead-runtime", deploymentId, stages, payload, summary: payload.summary });
}
