import type {
  ExecutionAuditBundle,
  ExecutionEngineResult,
  ExecutionPlan,
  ExecutionRunMode,
  ExecutionSafetyGateResult,
} from "./types";

export function buildExecutionAuditBundle(input: {
  deploymentId: string;
  mode: ExecutionRunMode;
  plan: ExecutionPlan;
  safetyGate: ExecutionSafetyGateResult;
  engine: ExecutionEngineResult;
}): ExecutionAuditBundle {
  const now = new Date().toISOString();
  const succeeded = input.engine.outcomes.filter((o) => o.status === "completed").length;
  const failed = input.engine.outcomes.filter((o) => o.status === "failed" || o.status === "blocked").length;
  const overallSuccess = failed === 0 && succeeded > 0;

  const traceEvents = [
    { event: "safety-gate", detail: `allowed=${input.safetyGate.allowed}`, timestamp: now },
    { event: "plan", detail: `steps=${input.plan.steps.length} staged=${input.plan.staged}`, timestamp: now },
    ...input.engine.outcomes.map((outcome) => ({
      event: "step",
      detail: `${outcome.stepId}:${outcome.status}`,
      timestamp: outcome.completedAt,
    })),
  ];

  return {
    records: [
      {
        recordId: `execution-record-${input.deploymentId}`,
        planId: input.plan.planId,
        mode: input.mode,
        status: overallSuccess ? "completed" : failed > 0 ? "failed" : "blocked",
        timestamp: now,
      },
    ],
    trace: {
      traceId: `execution-trace-${input.deploymentId}`,
      events: traceEvents,
    },
    outcome: {
      outcomeId: `execution-outcome-${input.deploymentId}`,
      planId: input.plan.planId,
      success: overallSuccess,
      stepsSucceeded: succeeded,
      stepsFailed: failed,
    },
    evidence: {
      evidenceId: `execution-evidence-${input.deploymentId}`,
      planId: input.plan.planId,
      artifacts: [
        `safety-gate:${input.safetyGate.gateId}`,
        `engine:${input.engine.engineId}`,
        `approval:${input.safetyGate.approval.approvalId}`,
      ],
    },
  };
}
