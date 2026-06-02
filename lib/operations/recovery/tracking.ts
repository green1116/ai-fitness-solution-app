import type {
  RecoveryLifecyclePhase,
  RecoveryOrchestration,
  RecoveryOutcome,
  RecoveryPlan,
  RecoveryRequest,
  RecoveryTimeline,
  RecoveryTrackingBundle,
} from "./types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildRecoveryTrackingBundle(input: {
  deploymentId: string;
  requests: RecoveryRequest[];
  plans: RecoveryPlan[];
  orchestrations: RecoveryOrchestration[];
  lifecyclePhases: RecoveryLifecyclePhase[];
  execution?: OperationalAutonomousExecutionRuntimeResult;
}): RecoveryTrackingBundle {
  const now = new Date().toISOString();
  const primaryRequest = input.requests[0];
  const verified = input.orchestrations.some((o) => o.chainComplete);
  const success =
    verified ||
    input.execution?.audit.outcome.success === true ||
    input.orchestrations.some((o) => o.verification.some((s) => s.status === "completed"));

  const timelines: RecoveryTimeline[] = input.requests.map((request) => ({
    timelineId: `recovery-timeline-${request.requestId}`,
    requestId: request.requestId,
    entries: input.lifecyclePhases.map((phase) => ({
      entryId: `recovery-timeline-${phase}-${request.requestId}`,
      phase,
      detail: `${phase}-recorded`,
      timestamp: now,
    })),
  }));

  const traceEvents: { event: string; detail: string; timestamp: string }[] = input.lifecyclePhases.map(
    (phase) => ({
      event: phase,
      detail: `${phase}-tracked`,
      timestamp: now,
    }),
  );

  if (input.execution) {
    traceEvents.push({
      event: "execution-linked",
      detail: `engine=${input.execution.engine.engineId}`,
      timestamp: now,
    });
  }

  const outcome: RecoveryOutcome = {
    outcomeId: `recovery-outcome-${input.deploymentId}`,
    requestId: primaryRequest?.requestId ?? "none",
    success,
    verified,
    message: `recoveries=${input.requests.length} plans=${input.plans.length} orchestrations=${input.orchestrations.length}`,
  };

  return {
    timelines,
    trace: {
      traceId: `recovery-trace-${input.deploymentId}`,
      events: traceEvents,
    },
    evidence: {
      evidenceId: `recovery-evidence-${input.deploymentId}`,
      requestId: primaryRequest?.requestId ?? "none",
      artifacts: [
        `requests:${input.requests.length}`,
        `plans:${input.plans.length}`,
        `orchestrations:${input.orchestrations.length}`,
        input.execution ? `execution:${input.execution.registry.executionRuntimeId}` : "execution:none",
      ],
    },
    outcome,
  };
}
