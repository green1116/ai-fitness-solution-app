import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildOpportunities } from "./builders";
import type { OpportunityRuntimePayload } from "./types";
import { OPPORTUNITY_RUNTIME_VERSION } from "./types";

export function validateOpportunityRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const opps = buildOpportunities(input);
  return { valid: opps.length >= 3 && opps.every((o) => o.estimatedValueCny > 0) };
}

export function runOpportunityRuntime(input?: {
  deploymentId?: string;
}): RevOpsRuntimeResult<OpportunityRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "opportunity-default";
  const stages: RevOpsStageResult[] = [];

  const opportunities = runStage("opportunity-build", "Opportunities", () => buildOpportunities({ deploymentId }), stages);
  const validation = runStage("opportunity-validate", "Opportunity Validation", () => validateOpportunityRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Opportunity runtime validation failed");

  const pipelineValueCny = opportunities.reduce((s, o) => s + o.estimatedValueCny * o.closeProbability, 0);
  const payload: OpportunityRuntimePayload = {
    version: OPPORTUNITY_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    opportunities,
    pipelineValueCny: Math.round(pipelineValueCny),
    summary: `opportunity-runtime count=${opportunities.length} weightedValue=${Math.round(pipelineValueCny)}`,
  };

  return finalizeRuntime({ domain: "opportunity-runtime", deploymentId, stages, payload, summary: payload.summary });
}
