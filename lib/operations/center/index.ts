export * from "./types";
export * from "./dashboard";
export * from "./correlation";
export * from "./health";
export * from "./risk";
export * from "./timeline";
export * from "./summary";

import {
  AUTONOMOUS_OPERATIONS_CENTER_RUNTIME_VERSION,
  type AutonomousOperationsCenterRuntimeInput,
  type AutonomousOperationsCenterRuntimeResult,
  type OperationsCenter,
  type OperationsState,
} from "./types";
import { buildOperationsDashboard } from "./dashboard";
import { buildOperationsCorrelationGraph } from "./correlation";
import { computeOperationsHealth } from "./health";
import { buildOperationsRiskProfile } from "./risk";
import { buildOperationsTimeline } from "./timeline";
import {
  buildDefaultRecommendations,
  buildOperationsCommands,
  buildOperationsSnapshot,
  buildOperationsSummary,
  deriveOperationsInsights,
} from "./summary";

const OPERATIONS_LOOP_PHASES = [
  "observe",
  "analyze",
  "predict",
  "recommend",
  "approve",
  "change",
  "execute",
  "incident",
  "recover",
  "operate",
] as const;

export function buildAutonomousOperationsCenterRuntime(
  input: AutonomousOperationsCenterRuntimeInput,
): AutonomousOperationsCenterRuntimeResult {
  const center: OperationsCenter = {
    centerId: `autonomous-operations-center-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    platformVersion: "V4-A4",
    runtimes: {
      execution: input.execution.version,
      change: input.change.version,
      incident: input.incident.version,
      recovery: input.recovery.version,
    },
  };

  const dashboard = buildOperationsDashboard({
    deploymentId: input.deploymentId,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const correlation = buildOperationsCorrelationGraph({
    deploymentId: input.deploymentId,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const { health, compositeStatus } = computeOperationsHealth({
    deploymentId: input.deploymentId,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const risk = buildOperationsRiskProfile({
    deploymentId: input.deploymentId,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const timeline = buildOperationsTimeline({
    deploymentId: input.deploymentId,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const summary = buildOperationsSummary({
    deploymentId: input.deploymentId,
    status: compositeStatus,
    health,
    risk,
    dashboard,
    correlation,
  });

  const snapshot = buildOperationsSnapshot({
    deploymentId: input.deploymentId,
    status: compositeStatus,
    health,
    risk,
  });

  const recommendations = buildDefaultRecommendations({
    deploymentId: input.deploymentId,
    change: input.change,
    incident: input.incident,
    recovery: input.recovery,
  });

  const insights = deriveOperationsInsights({
    deploymentId: input.deploymentId,
    health,
    risk,
    correlation,
    execution: input.execution,
    incident: input.incident,
  });

  const { commands, actions } = buildOperationsCommands({
    deploymentId: input.deploymentId,
    recommendations,
  });

  const state: OperationsState = {
    stateId: `operations-state-${input.deploymentId}`,
    executionStatus: input.execution.status,
    changeStatus: input.change.status,
    incidentStatus: input.incident.status,
    recoveryStatus: input.recovery.status,
    compositeStatus,
  };

  const loopClosed =
    health.status !== "critical" &&
    input.incident.metrics.open <= 1 &&
    input.recovery.tracking.outcome.verified;

  let currentPhase = "operate";
  if (!loopClosed && compositeStatus === "recovering") currentPhase = "recover";
  else if (!loopClosed && input.incident.metrics.open > 0) currentPhase = "incident";
  else if (!loopClosed && input.change.metrics.changes > 0) currentPhase = "change";

  const flags = {
    dashboard: Boolean(dashboard.dashboardId),
    correlation: correlation.correlations.length >= 0,
    health: health.indicators.length > 0,
    risk: risk.indicators.length > 0,
    timeline: timeline.entries.length > 0,
    summary: summary.text.length > 0,
  };

  const traceId = `autonomous-operations-center-trace-${input.deploymentId}`;

  return {
    version: AUTONOMOUS_OPERATIONS_CENTER_RUNTIME_VERSION,
    center,
    state,
    health,
    dashboard,
    correlation,
    risk,
    timeline,
    summary,
    snapshot,
    insights,
    commands,
    actions,
    recommendations,
    flags,
    loop: {
      phases: [...OPERATIONS_LOOP_PHASES],
      currentPhase,
      closed: loopClosed,
    },
    summaryText: {
      summaryId: `operations-center-summary-${Date.now()}`,
      text: `${summary.text} loop=${loopClosed} timeline=${timeline.entries.length}`,
      traceId,
    },
    status: compositeStatus,
  };
}

export { AUTONOMOUS_OPERATIONS_CENTER_RUNTIME_VERSION };
