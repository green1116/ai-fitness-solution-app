import type { ExecutionEngineResult, ExecutionMetrics, ExecutionSafetyGateResult } from "./types";

export function computeExecutionMetrics(input: {
  deploymentId: string;
  engine: ExecutionEngineResult;
  safetyGate: ExecutionSafetyGateResult;
  rollbackExecuted: boolean;
}): ExecutionMetrics {
  const executions = input.engine.outcomes.length;
  const successes = input.engine.outcomes.filter((o) => o.status === "completed").length;
  const failures = input.engine.outcomes.filter((o) => o.status === "failed").length;
  const blocked = input.engine.outcomes.filter((o) => o.status === "blocked").length;
  const rollbacks = input.rollbackExecuted ? 1 : 0;
  const successRate = executions > 0 ? Math.round((successes / executions) * 100) : 0;

  return {
    metricsId: `execution-metrics-${input.deploymentId}`,
    executions,
    successes,
    failures,
    rollbacks,
    blocked: blocked + (input.safetyGate.allowed ? 0 : 1),
    successRate,
  };
}
