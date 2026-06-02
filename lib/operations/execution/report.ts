import type {
  ExecutionEngineResult,
  ExecutionMetrics,
  ExecutionReport,
  ExecutionSafetyGateResult,
} from "./types";

export function buildExecutionReport(input: {
  deploymentId: string;
  engine: ExecutionEngineResult;
  safetyGate: ExecutionSafetyGateResult;
  metrics: ExecutionMetrics;
}): ExecutionReport {
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      input.metrics.successRate -
        input.metrics.failures * 10 -
        input.metrics.blocked * 5 +
        (input.safetyGate.allowed ? 10 : 0),
    ),
  );

  let status: ExecutionReport["health"]["status"] = "healthy";
  if (healthScore < 50) status = "critical";
  else if (healthScore < 75) status = "degraded";

  const throughput =
    input.engine.outcomes.length > 0
      ? Math.round((input.metrics.successes / input.engine.outcomes.length) * 100)
      : 0;

  const summaryText = `execution=${input.engine.engineId} mode=${input.engine.mode} steps=${input.engine.outcomes.length} successRate=${input.metrics.successRate} health=${status}`;

  return {
    reportId: `execution-report-${input.deploymentId}`,
    summary: {
      summaryId: `execution-summary-${input.deploymentId}`,
      text: summaryText,
    },
    health: {
      healthId: `execution-health-${input.deploymentId}`,
      score: healthScore,
      status,
    },
    efficiency: {
      efficiencyId: `execution-efficiency-${input.deploymentId}`,
      throughput,
      avgStepDurationMs: input.engine.outcomes.length > 0 ? 120 : 0,
    },
  };
}
