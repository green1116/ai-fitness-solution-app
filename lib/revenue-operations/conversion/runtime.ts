import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildConversionMetrics } from "./builders";
import type { ConversionRuntimePayload } from "./types";
import { CONVERSION_RUNTIME_VERSION } from "./types";

export function validateConversionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildConversionMetrics(input);
  return { valid: metrics.length === 3 && metrics.every((m) => m.rate >= 0 && m.rate <= 1) };
}

export function runConversionRuntime(input?: {
  deploymentId?: string;
}): RevOpsRuntimeResult<ConversionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "conversion-default";
  const stages: RevOpsStageResult[] = [];

  const metrics = runStage("conversion-build", "Conversion Metrics", () => buildConversionMetrics({ deploymentId }), stages);
  const validation = runStage("conversion-validate", "Conversion Validation", () => validateConversionRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Conversion runtime validation failed");

  const overallConversionRate =
    metrics.reduce((s, m) => s + m.rate, 0) / metrics.length;

  const payload: ConversionRuntimePayload = {
    version: CONVERSION_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    metrics,
    overallConversionRate: Math.round(overallConversionRate * 100) / 100,
    summary: `conversion-runtime lead=${(metrics[0].rate * 100).toFixed(0)}% trial=${(metrics[1].rate * 100).toFixed(0)}% customer=${(metrics[2].rate * 100).toFixed(0)}%`,
  };

  return finalizeRuntime({ domain: "conversion-runtime", deploymentId, stages, payload, summary: payload.summary });
}
