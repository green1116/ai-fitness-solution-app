import type { WorkflowType } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import {
  APPROVAL_WORKFLOW_STATES,
  APPROVAL_WORKFLOW_TRANSITIONS,
  DELIVERY_WORKFLOW_STATES,
  DELIVERY_WORKFLOW_TRANSITIONS,
  RELEASE_WORKFLOW_STATES,
  RELEASE_WORKFLOW_TRANSITIONS,
  type ApprovalWorkflowState,
  type DeliveryWorkflowState,
  type ReleaseWorkflowState,
} from "./workflow-state-definitions";
import {
  QUOTE_WORKFLOW_STATES,
  QUOTE_WORKFLOW_TRANSITIONS,
  type QuoteWorkflowState,
} from "./workflow-types";
import {
  getAllowedTransitions as getQuoteAllowedTransitions,
  validateTransition as validateQuoteTransition,
} from "./workflow-state-machine";

function isApprovalState(state: string): state is ApprovalWorkflowState {
  return (APPROVAL_WORKFLOW_STATES as readonly string[]).includes(state);
}

function isDeliveryState(state: string): state is DeliveryWorkflowState {
  return (DELIVERY_WORKFLOW_STATES as readonly string[]).includes(state);
}

function isReleaseState(state: string): state is ReleaseWorkflowState {
  return (RELEASE_WORKFLOW_STATES as readonly string[]).includes(state);
}

export function getBusinessAllowedTransitions(workflowType: WorkflowType, fromState: string): string[] {
  if (workflowType === "QUOTE") return getQuoteAllowedTransitions(workflowType, fromState);
  if (workflowType === "APPROVAL" && isApprovalState(fromState)) {
    return [...APPROVAL_WORKFLOW_TRANSITIONS[fromState]];
  }
  if (workflowType === "DELIVERY" && isDeliveryState(fromState)) {
    return [...DELIVERY_WORKFLOW_TRANSITIONS[fromState]];
  }
  if (workflowType === "RELEASE" && isReleaseState(fromState)) {
    return [...RELEASE_WORKFLOW_TRANSITIONS[fromState]];
  }
  return [];
}

export function validateBusinessTransition(
  workflowType: WorkflowType,
  fromState: string,
  toState: string,
): boolean {
  if (workflowType === "QUOTE") return validateQuoteTransition(workflowType, fromState, toState);
  if (workflowType === "APPROVAL") {
    return isApprovalState(fromState) && isApprovalState(toState) && APPROVAL_WORKFLOW_TRANSITIONS[fromState].includes(toState);
  }
  if (workflowType === "DELIVERY") {
    return isDeliveryState(fromState) && isDeliveryState(toState) && DELIVERY_WORKFLOW_TRANSITIONS[fromState].includes(toState);
  }
  if (workflowType === "RELEASE") {
    return isReleaseState(fromState) && isReleaseState(toState) && RELEASE_WORKFLOW_TRANSITIONS[fromState].includes(toState);
  }
  return false;
}

export function assertValidBusinessWorkflowState(workflowType: WorkflowType, state: string): void {
  const valid =
    (workflowType === "QUOTE" && (QUOTE_WORKFLOW_STATES as readonly string[]).includes(state)) ||
    (workflowType === "APPROVAL" && isApprovalState(state)) ||
    (workflowType === "DELIVERY" && isDeliveryState(state)) ||
    (workflowType === "RELEASE" && isReleaseState(state));

  if (!valid) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_STATE_INVALID,
      `Invalid ${workflowType} workflow state: ${state}`,
    );
  }
}

export function getInitialBusinessWorkflowState(workflowType: WorkflowType): string {
  switch (workflowType) {
    case "QUOTE":
      return "draft";
    case "APPROVAL":
      return "pending";
    case "DELIVERY":
      return "planned";
    case "RELEASE":
      return "draft";
    default:
      throw new SaasWorkflowRuntimeError(WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_INVALID, `Unknown workflow type: ${workflowType}`);
  }
}

export function getTerminalBusinessWorkflowState(workflowType: WorkflowType): string {
  switch (workflowType) {
    case "QUOTE":
      return "released";
    case "APPROVAL":
      return "approved";
    case "DELIVERY":
      return "completed";
    case "RELEASE":
      return "released";
    default:
      throw new SaasWorkflowRuntimeError(WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_INVALID, `Unknown workflow type: ${workflowType}`);
  }
}
