import type { TransitionWorkflowInput, WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { appendWorkflowHistory } from "./workflow-instance";
import { hasWorkflowEvent, recordWorkflowEvent } from "./workflow-events";
import { requireWorkflowInstance, saveWorkflowInstance } from "./workflow-repository";
import { assertValidWorkflowState, validateTransition } from "./workflow-state-machine";
import { assertValidWorkflowInstance } from "./workflow-validation";

export function transitionWorkflow(input: TransitionWorkflowInput): WorkflowInstance {
  const current = requireWorkflowInstance(input.workflowId);
  assertValidWorkflowInstance(current);

  const fromState = current.currentState;
  assertValidWorkflowState(current.workflowType, input.toState);

  if (!validateTransition(current.workflowType, fromState, input.toState)) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_TRANSITION_DENIED,
      `Transition denied: ${fromState} -> ${input.toState}`,
    );
  }

  const timestamp = new Date().toISOString();
  const next = appendWorkflowHistory(current, {
    fromState,
    toState: input.toState,
    timestamp,
    actor: input.actor,
    reason: input.reason,
  });

  assertValidWorkflowInstance(next);
  const saved = saveWorkflowInstance(next);

  recordWorkflowEvent({
    eventType: "STATE_CHANGED",
    workflowId: saved.workflowId,
    workspaceProductId: saved.workspaceProductId,
    workflowType: saved.workflowType,
    fromState,
    toState: input.toState,
    actor: input.actor,
    reason: input.reason,
  });

  if (input.toState === "released" && !hasWorkflowEvent(saved.workflowId, "WORKFLOW_RELEASED")) {
    recordWorkflowEvent({
      eventType: "WORKFLOW_RELEASED",
      workflowId: saved.workflowId,
      workspaceProductId: saved.workspaceProductId,
      workflowType: saved.workflowType,
      fromState,
      toState: input.toState,
      actor: input.actor,
      reason: input.reason,
    });
  }

  return saved;
}
