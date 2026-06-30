/**
 * V65 P5 — Unified runtime risk gate entry
 */
import { buildRuntimeRiskReport } from "./runtime.builder";
import type { RuntimeRiskReport } from "./runtime.types";

export function runRuntimeRiskGate(input?: {
  deploymentId?: string;
}): RuntimeRiskReport {
  return buildRuntimeRiskReport(input);
}

export function assertRuntimeRiskPass(input?: {
  deploymentId?: string;
}): RuntimeRiskReport {
  const report = runRuntimeRiskGate(input);
  if (!report.runtimeRiskOk) {
    const open = report.mitigations.filter((m) => !m.mitigated).map((m) => m.id);
    throw new Error(`V65 runtime risk gate failed: open=${open.join(",")}`);
  }
  return report;
}
