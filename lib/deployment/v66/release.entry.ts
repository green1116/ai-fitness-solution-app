/**
 * V66 P4 — Release orchestration entry (read-only)
 */
import { buildReleaseOrchestrationReport } from "./release.builder";
import type { ReleaseOrchestrationReport, ReleaseOrchestrationSignals } from "./release.types";

export type { ReleaseOrchestrationSignals };

export function runReleaseOrchestration(input?: {
  deploymentId?: string;
  signals?: ReleaseOrchestrationSignals;
}): ReleaseOrchestrationReport {
  return buildReleaseOrchestrationReport(input);
}

export function formatReleaseOrchestrationSummary(
  report: ReleaseOrchestrationReport,
): string {
  const lines = [
    "V66 Release Orchestration & Rollback Guard",
    `  ready: ${report.orchestrationReady}`,
    `  score: ${report.readinessScore}/100`,
    `  observability: ${report.observabilityVersion} (ready=${report.observabilityReady})`,
    `  release layers: ${report.releaseManifest.layerCount}`,
    `  rollout stages: ${report.rolloutStages.passCount}/${report.rolloutStages.stageCount}`,
    `  rollback guards: ${report.rollbackGuard.armedCount}/${report.rollbackGuard.ruleCount}`,
    `  guard intact: ${report.rollbackGuard.guardIntact}`,
  ];
  return lines.join("\n");
}
