import type { TransitionWorkflowInput, WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { appendWorkflowHistory } from "./workflow-instance";
import { recordWorkflowEvent } from "./workflow-events";
import { requireWorkflowInstance, saveWorkflowInstance } from "./workflow-repository";
import {
  assertValidBusinessWorkflowState,
  validateBusinessTransition,
} from "./multi-workflow-state-machine";
import { assertValidBusinessWorkflowInstance } from "./workflow-validation-p5";

export function transitionBusinessWorkflow(input: TransitionWorkflowInput): WorkflowInstance {
  const current = requireWorkflowInstance(input.workflowId);
  assertValidBusinessWorkflowInstance(current);

  const fromState = current.currentState;
  assertValidBusinessWorkflowState(current.workflowType, input.toState);

  if (!validateBusinessTransition(current.workflowType, fromState, input.toState)) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_TRANSITION_DENIED,
      `Business transition denied: ${fromState} -> ${input.toState}`,
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

  assertValidBusinessWorkflowInstance(next);
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

  if (input.toState === "released" && saved.workflowType === "RELEASE") {
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
