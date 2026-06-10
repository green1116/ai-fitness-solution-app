import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildAdoptionMetrics } from "./builders";
import type { AdoptionRuntimePayload } from "./types";
import { ADOPTION_RUNTIME_VERSION } from "./types";

export function validateAdoptionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildAdoptionMetrics(input);
  return { valid: metrics.length === 3 && metrics.every((m) => m.adoptionRate > 0) };
}

export function runAdoptionRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<AdoptionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "adoption-default";
  const stages: CustomerSuccessStageResult[] = [];

  const metrics = runStage("adoption-build", "Adoption Metrics", () => buildAdoptionMetrics({ deploymentId }), stages);
  const validation = runStage("adoption-validate", "Adoption Validation", () => validateAdoptionRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Adoption runtime validation failed");

  const overallAdoptionRate =
    Math.round((metrics.reduce((s, m) => s + m.adoptionRate, 0) / metrics.length) * 100) / 100;

  const payload: AdoptionRuntimePayload = {
    version: ADOPTION_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    metrics,
    overallAdoptionRate,
    summary: `adoption-runtime feature=${(metrics[0].adoptionRate * 100).toFixed(0)}% proposal=${(metrics[1].adoptionRate * 100).toFixed(0)}% delivery=${(metrics[2].adoptionRate * 100).toFixed(0)}%`,
  };

  return finalizeRuntime({ domain: "adoption-runtime", deploymentId, stages, payload, summary: payload.summary });
}
