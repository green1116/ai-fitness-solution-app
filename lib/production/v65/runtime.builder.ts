/**
 * V65 P5 — Runtime risk report builder
 */
import { assessRuntimeRiskMitigations } from "./runtime.guards";
import type { RuntimeRiskReport } from "./runtime.types";
import { V65_RUNTIME_RISK_LAYER_VERSION } from "./runtime.types";

export function buildRuntimeRiskReport(input?: {
  deploymentId?: string;
}): RuntimeRiskReport {
  const deploymentId = input?.deploymentId ?? "v65-runtime-risk-default";
  const mitigations = assessRuntimeRiskMitigations();
  const openRiskCount = mitigations.filter((item) => !item.mitigated).length;
  const runtimeRiskOk = openRiskCount === 0;

  return {
    version: V65_RUNTIME_RISK_LAYER_VERSION,
    reportId: `runtime-risk-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    mitigations,
    openRiskCount,
    runtimeRiskOk,
    summary: [
      `runtime-risk ok=${runtimeRiskOk}`,
      `open=${openRiskCount}`,
      `mitigations=${mitigations.filter((m) => m.mitigated).length}/${mitigations.length}`,
    ].join(" "),
  };
}
