import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildExpansionOpportunities } from "./builders";
import type { ExpansionRuntimePayload } from "./types";
import { EXPANSION_RUNTIME_VERSION } from "./types";

export function validateExpansionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const opps = buildExpansionOpportunities(input);
  return { valid: opps.length >= 2 && opps.some((o) => o.type === "upgrade") };
}

export function runExpansionRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<ExpansionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "expansion-default";
  const stages: CustomerSuccessStageResult[] = [];

  const opportunities = runStage("expansion-build", "Expansion Opportunities", () => buildExpansionOpportunities({ deploymentId }), stages);
  const validation = runStage("expansion-validate", "Expansion Validation", () => validateExpansionRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Expansion runtime validation failed");

  const payload: ExpansionRuntimePayload = {
    version: EXPANSION_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    opportunities,
    upgradeCount: opportunities.filter((o) => o.type === "upgrade").length,
    crossSellCount: opportunities.filter((o) => o.type === "cross-sell").length,
    enterpriseCount: opportunities.filter((o) => o.type === "enterprise").length,
    summary: `expansion-runtime total=${opportunities.length} upgrade=${opportunities.filter((o) => o.type === "upgrade").length} cross-sell=${opportunities.filter((o) => o.type === "cross-sell").length}`,
  };

  return finalizeRuntime({ domain: "expansion-runtime", deploymentId, stages, payload, summary: payload.summary });
}
