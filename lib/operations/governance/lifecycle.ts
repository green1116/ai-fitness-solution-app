import {
  GOVERNANCE_LIFECYCLE_VERSION,
  type GovernanceLifecycleRuntimeInput,
  type GovernanceLifecycleRuntimeResult,
} from "./lifecycle.types";
import { buildInitialGovernanceLifecycleState } from "./lifecycle.state";
import { canTransitionLifecycle, createLifecycleTransition } from "./lifecycle.transition";
import { buildLifecycleRetry } from "./lifecycle.retry";
import { buildLifecycleResumeTransition } from "./lifecycle.resume";
import { buildLifecycleArchive, buildLifecycleSnapshot } from "./lifecycle.archive";
import { buildLifecycleReplay } from "./lifecycle.replay";
import { summarizeGovernanceLifecycle } from "./lifecycle.summary";

export function buildGovernanceLifecycle(
  input: GovernanceLifecycleRuntimeInput,
): GovernanceLifecycleRuntimeResult {
  const transitions: GovernanceLifecycleRuntimeResult["transitions"] = [];
  const retries: GovernanceLifecycleRuntimeResult["retries"] = [];
  const snapshots: GovernanceLifecycleRuntimeResult["snapshots"] = [];
  const timeline = input.orchestration.timeline.entries;

  let state = buildInitialGovernanceLifecycleState(input);
  const pushTransition = (from: typeof state.status, to: typeof state.status, reason: string) => {
    if (!canTransitionLifecycle(from, to)) return;
    transitions.push(
      createLifecycleTransition({ from, to, reason, timestamp: input.observedAt }),
    );
    state = { ...state, status: to };
  };

  pushTransition("created", "queued", "Lifecycle initialized from orchestration output.");
  pushTransition("queued", "running", "Execution queue started.");

  const hasApprovalPending = input.orchestration.plan.steps.some(
    (s) => (s.action === "approve" || s.action === "manualReview") && s.status === "pending",
  );
  const hasEscalation = input.orchestration.plan.steps.some((s) => s.action === "escalate");

  if (hasApprovalPending) {
    pushTransition("running", "waitingApproval", "Approval pending requires wait state.");
    transitions.push(
      buildLifecycleResumeTransition({
        from: "waitingApproval",
        reason: "Approval workflow resumed for remaining steps.",
        timestamp: input.observedAt,
      }),
    );
    state = { ...state, status: "resumed" };
    pushTransition("resumed", "running", "Lifecycle resumed to continue execution.");
  }

  if (hasEscalation) {
    pushTransition("running", "escalated", "Escalation step exists in orchestration plan.");
    pushTransition("escalated", "running", "Escalation branch returned to execution.");
  }

  const hasFailedStep = timeline.some((e) => e.status === "pending" && e.note.includes("requires human"));
  if (hasFailedStep) {
    pushTransition("running", "failed", "Pending human-required step treated as recoverable failure.");
    const retry = buildLifecycleRetry({
      attempt: 1,
      reason: "Human approval not completed in current runtime cycle.",
      timestamp: input.observedAt,
      escalated: hasEscalation,
    });
    retries.push(retry);
    pushTransition("failed", "retrying", `Retry requested: ${retry.reason}`);
    transitions.push(
      buildLifecycleResumeTransition({
        from: "retrying",
        reason: "Retry resumed lifecycle execution.",
        timestamp: input.observedAt,
      }),
    );
    state = { ...state, status: "resumed" };
    pushTransition("resumed", "running", "Retry resumed running phase.");
  }

  pushTransition("running", "completed", "Lifecycle reached completion phase.");
  pushTransition("completed", "archived", "Completed lifecycle archived for audit replay.");

  const archive = buildLifecycleArchive({
    archived: state.status === "archived",
    observedAt: input.observedAt,
    reason: "Lifecycle completion archival policy.",
  });
  const replay = buildLifecycleReplay(input);

  snapshots.push(
    buildLifecycleSnapshot({
      status: "queued",
      queueSize: input.orchestration.queue.length,
      timelineSize: timeline.length,
      capturedAt: input.observedAt,
    }),
  );
  snapshots.push(
    buildLifecycleSnapshot({
      status: state.status,
      queueSize: input.orchestration.queue.length,
      timelineSize: timeline.length,
      capturedAt: input.observedAt,
    }),
  );

  const lifecycleCore: Omit<GovernanceLifecycleRuntimeResult, "summary"> = {
    version: GOVERNANCE_LIFECYCLE_VERSION,
    state: {
      ...state,
      stepIndex: input.orchestration.state.completedSteps,
      isComplete: state.status === "completed" || state.status === "archived",
      isFailed: transitions.some((t) => t.to === "failed"),
      canReplay: replay.supported,
    },
    transitions,
    timeline,
    retries,
    replay,
    archive,
    snapshots,
    queue: input.orchestration.queue,
  };

  return {
    ...lifecycleCore,
    summary: summarizeGovernanceLifecycle(lifecycleCore),
  };
}

export { GOVERNANCE_LIFECYCLE_VERSION };
