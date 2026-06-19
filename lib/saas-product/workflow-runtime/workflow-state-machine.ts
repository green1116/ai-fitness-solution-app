import type { WorkflowType } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import {
  QUOTE_WORKFLOW_STATES,
  QUOTE_WORKFLOW_TRANSITIONS,
  type QuoteWorkflowState,
} from "./workflow-types";

function isQuoteWorkflowState(state: string): state is QuoteWorkflowState {
  return (QUOTE_WORKFLOW_STATES as readonly string[]).includes(state);
}

export function getAllowedTransitions(workflowType: WorkflowType, fromState: string): string[] {
  if (workflowType === "QUOTE") {
    if (!isQuoteWorkflowState(fromState)) return [];
    return [...QUOTE_WORKFLOW_TRANSITIONS[fromState]];
  }
  return [];
}

export function validateTransition(workflowType: WorkflowType, fromState: string, toState: string): boolean {
  if (workflowType === "QUOTE") {
    if (!isQuoteWorkflowState(fromState) || !isQuoteWorkflowState(toState)) return false;
    return QUOTE_WORKFLOW_TRANSITIONS[fromState].includes(toState);
  }
  return false;
}

export function assertValidWorkflowState(workflowType: WorkflowType, state: string): void {
  if (workflowType === "QUOTE" && !isQuoteWorkflowState(state)) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_STATE_INVALID,
      `Invalid quote workflow state: ${state}`,
    );
  }
  if (workflowType !== "QUOTE") {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_INVALID,
      `Workflow type not enabled in P4: ${workflowType}`,
    );
  }
}
