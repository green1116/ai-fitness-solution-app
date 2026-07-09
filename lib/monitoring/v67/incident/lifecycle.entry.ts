/**
 * V67 P2 — Incident lifecycle entry (read-only)
 */
import { buildIncidentLifecycleReport } from "./lifecycle.builder";
import type { IncidentLifecycleReport, IncidentLifecycleSignals } from "./lifecycle.types";

export type { IncidentLifecycleSignals };

export function runIncidentLifecycle(input?: {
  deploymentId?: string;
  signals?: IncidentLifecycleSignals;
}): IncidentLifecycleReport {
  return buildIncidentLifecycleReport(input);
}

export function formatIncidentLifecycleSummary(report: IncidentLifecycleReport): string {
  const lines = [
    "V67 Incident Lifecycle & State Machine",
    `  ready: ${report.lifecycleReady}`,
    `  score: ${report.readinessScore}/100`,
    `  foundation: ${report.foundationVersion} (ready=${report.foundationReady})`,
    `  states: ${report.stateMachine.stateCount}`,
    `  transition rules: ${report.transitionRules.ruleCount}`,
    `  sample incidents: ${report.sampleLifecycle.length}`,
  ];
  return lines.join("\n");
}
