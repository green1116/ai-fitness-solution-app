import type { RuntimeVisualizationDashboard } from "../types";

export function formatRuntimeVisualizationDebug(
  dashboard: RuntimeVisualizationDashboard,
): {
  summary: string;
  metricsTable: string;
  pipelineTrace: string;
} {
  const summary = [
    "[ExecutiveRuntimeVisualization]",
    `Executive Score: ${dashboard.executiveScore}`,
    `Gate: ${dashboard.executiveGate}`,
    `Release: ${dashboard.releaseDecision}`,
    `Releasable: ${dashboard.releasable}`,
  ].join("\n");

  const metricsTable = [
    "Metrics:",
    ...dashboard.metrics.map(
      (m) => `  ${m.label}: ${m.score} (${m.status})`,
    ),
  ].join("\n");

  const pipelineTrace = [
    "Pipeline:",
    ...dashboard.pipeline.map(
      (s) => `  ${s.label}: ${s.status} — ${s.summary}`,
    ),
  ].join("\n");

  return { summary, metricsTable, pipelineTrace };
}
