export * from "./types";
export * from "./planner";
export * from "./safety";
export * from "./engine";
export * from "./rollback";
export * from "./audit";
export * from "./metrics";
export * from "./report";

import {
  OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION,
  type ExecutionRunMode,
  type ExecutionStatus,
  type OperationalAutonomousExecutionRuntimeInput,
  type OperationalAutonomousExecutionRuntimeResult,
  type OperationalAutonomousLoopPhase,
} from "./types";
import { buildExecutionCandidates, buildExecutionPlan } from "./planner";
import { runExecutionSafetyGate } from "./safety";
import { executePlan } from "./engine";
import { buildRollbackPlan, executeRollback } from "./rollback";
import { buildExecutionAuditBundle } from "./audit";
import { computeExecutionMetrics } from "./metrics";
import { buildExecutionReport } from "./report";

const LOOP_PHASES: OperationalAutonomousLoopPhase[] = [
  "observe",
  "analyze",
  "predict",
  "recommend",
  "plan",
  "approve",
  "execute",
];

function resolveApprovedProposalIds(autonomous: OperationalAutonomousExecutionRuntimeInput["autonomous"]): string[] {
  if (autonomous.approval.status === "blocked") {
    return autonomous.proposals.slice(0, 1).map((p) => p.proposalId);
  }
  if (autonomous.approval.status === "auto_approved") {
    return autonomous.proposals.map((p) => p.proposalId);
  }
  return autonomous.proposals.slice(0, 3).map((p) => p.proposalId);
}

export function buildOperationalAutonomousExecutionRuntime(
  input: OperationalAutonomousExecutionRuntimeInput,
): OperationalAutonomousExecutionRuntimeResult {
  const mode: ExecutionRunMode = input.mode ?? "dry-run";

  const approvedProposalIds = resolveApprovedProposalIds(input.autonomous);
  const candidates = buildExecutionCandidates({
    deploymentId: input.deploymentId,
    approvedProposalIds,
    proposals: input.autonomous.proposals.map((p) => ({
      proposalId: p.proposalId,
      action: p.action,
      confidence: p.confidence,
    })),
  });

  const plan =
    candidates.length > 0
      ? buildExecutionPlan({ deploymentId: input.deploymentId, mode, candidates })
      : buildExecutionPlan({
          deploymentId: input.deploymentId,
          mode,
          candidates: [
            {
              candidateId: `candidate-default-${input.deploymentId}`,
              action: {
                actionId: `action-default-${input.deploymentId}`,
                name: "observe-governance-state",
                category: "change",
                reversible: true,
              },
              intent: "observe",
              priority: "low",
              scope: "platform",
              owner: "system",
              window: {
                windowId: `window-default-${input.deploymentId}`,
                startsAt: new Date().toISOString(),
                endsAt: new Date(Date.now() + 3600_000).toISOString(),
                timezone: "UTC",
              },
              approved: true,
            },
          ],
        });

  const safetyGate = runExecutionSafetyGate({
    deploymentId: input.deploymentId,
    mode,
    plan,
    autonomous: input.autonomous,
  });

  const engine = executePlan({ plan, mode, safetyGate });

  const rollbackPlan = buildRollbackPlan({
    deploymentId: input.deploymentId,
    plan,
    engine,
    rollbackStrategy: input.autonomous.executionPlan.rollbackPlan,
  });
  const rollbackResult = executeRollback({ rollbackPlan, engine });

  const audit = buildExecutionAuditBundle({
    deploymentId: input.deploymentId,
    mode,
    plan,
    safetyGate,
    engine,
  });

  const metrics = computeExecutionMetrics({
    deploymentId: input.deploymentId,
    engine,
    safetyGate,
    rollbackExecuted: rollbackResult !== null,
  });

  const report = buildExecutionReport({
    deploymentId: input.deploymentId,
    engine,
    safetyGate,
    metrics,
  });

  const loopClosed =
    safetyGate.allowed &&
    engine.outcomes.length > 0 &&
    audit.outcome.success;

  const flags = {
    execution: engine.outcomes.length > 0,
    safety: safetyGate.safetyChecks.length > 0 && safetyGate.policyChecks.length > 0,
    rollback: rollbackPlan.steps.length > 0,
    audit: audit.records.length > 0 && audit.trace.events.length > 0,
    metrics: metrics.executions >= 0,
    reporting: report.summary.text.length > 0,
  };

  let status: ExecutionStatus = "completed";
  if (!safetyGate.allowed) status = "blocked";
  else if (engine.outcomes.some((o) => o.status === "failed")) status = "failed";
  else if (rollbackResult?.success) status = "rolled_back";

  const executionRuntimeId = `operational-autonomous-execution-${input.deploymentId}`;
  const traceId = `operational-autonomous-execution-trace-${input.deploymentId}`;

  return {
    version: OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION,
    registry: { executionRuntimeId, candidateCount: candidates.length },
    loop: {
      loopId: `operational-autonomous-loop-${input.deploymentId}`,
      phases: LOOP_PHASES,
      currentPhase: loopClosed ? "execute" : safetyGate.allowed ? "approve" : "plan",
      closed: loopClosed,
    },
    candidates,
    plan,
    safetyGate,
    engine,
    rollback: { plan: rollbackPlan, result: rollbackResult },
    audit,
    metrics,
    report,
    flags,
    summary: {
      summaryId: `execution-runtime-summary-${Date.now()}`,
      text: `${report.summary.text} loop=${loopClosed} allowed=${safetyGate.allowed} status=${status}`,
      traceId,
    },
    status,
  };
}

export { OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION };
