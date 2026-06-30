/**
 * V65 P8 — Unified production sign-off entry
 */
import { buildProductionSignoffReport } from "./signoff.builder";
import type { ProductionSignoffReport } from "./signoff.types";
import type { ReleaseGateSignals } from "./release.types";

export function runProductionSignoff(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ProductionSignoffReport {
  return buildProductionSignoffReport(input);
}

export function assertProductionSignoffPass(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ProductionSignoffReport {
  const report = runProductionSignoff(input);
  if (!report.signedOff) {
    const failed = report.phases.filter((p) => !p.ok).map((p) => p.id);
    throw new Error(
      `V65 production sign-off failed: signedOff=${report.signedOff} failedPhases=${failed.join(",") || "freeze"}`,
    );
  }
  return report;
}

export function closeV65Production(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ProductionSignoffReport {
  return assertProductionSignoffPass(input);
}
