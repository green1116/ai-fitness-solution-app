/**
 * E04-P2 — Business Workflow Instance Lifecycle
 * READY -> RUNNING -> COMPLETED -> RESULT
 */

import {
  WORKFLOW_INSTANCE_PHASES,
  WORKFLOW_INSTANCE_TRANSITIONS,
} from "./workflow.constants";
import type {
  WorkflowDefinition,
  WorkflowInstancePhase,
  WorkflowInstanceState,
  WorkflowInstanceTransition,
  WorkflowStepRuntimeState,
} from "./workflow.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceWorkflowPhase(
  from: WorkflowInstancePhase,
  to: WorkflowInstancePhase,
): boolean {
  return WORKFLOW_INSTANCE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createPendingStepStates(
  workflow: WorkflowDefinition,
): WorkflowStepRuntimeState[] {
  return workflow.steps.map((step) => ({
    stepId: step.id,
    status: "pending" as const,
    businessAgentId: step.businessAgentId,
    capabilityId: step.capabilityId,
    readOnly: true as const,
  }));
}

export function createReadyWorkflowState(
  workflow: WorkflowDefinition,
): WorkflowInstanceState {
  return {
    phase: "READY",
    phases: [...WORKFLOW_INSTANCE_PHASES],
    transitions: [],
    steps: createPendingStepStates(workflow),
    complete: false,
    readOnly: true,
  };
}

export function advanceWorkflowPhase(
  state: WorkflowInstanceState,
  to: WorkflowInstancePhase,
  note?: string,
): WorkflowInstanceState {
  if (!canAdvanceWorkflowPhase(state.phase, to)) {
    throw new Error(
      `Invalid workflow phase transition: ${state.phase} → ${to}`,
    );
  }

  const transition: WorkflowInstanceTransition = {
    from: state.phase,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    phase: to,
    phases: [...WORKFLOW_INSTANCE_PHASES],
    transitions: [...state.transitions, transition],
    steps: state.steps,
    complete: to === "RESULT",
    readOnly: true,
  };
}

export function updateStepState(
  state: WorkflowInstanceState,
  stepId: string,
  patch: Omit<Partial<WorkflowStepRuntimeState>, "stepId" | "readOnly">,
): WorkflowInstanceState {
  const steps = state.steps.map((step) => {
    if (step.stepId !== stepId) return step;
    return {
      ...step,
      ...patch,
      stepId: step.stepId,
      readOnly: true as const,
    };
  });

  return {
    ...state,
    steps,
    readOnly: true,
  };
}
