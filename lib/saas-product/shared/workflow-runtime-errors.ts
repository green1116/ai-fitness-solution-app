export const WORKFLOW_RUNTIME_ERROR_CODES = {
  WORKFLOW_NOT_FOUND: "WORKFLOW_NOT_FOUND",
  WORKFLOW_INVALID: "WORKFLOW_INVALID",
  WORKFLOW_TRANSITION_DENIED: "WORKFLOW_TRANSITION_DENIED",
  WORKFLOW_ALREADY_EXISTS: "WORKFLOW_ALREADY_EXISTS",
  WORKFLOW_STATE_INVALID: "WORKFLOW_STATE_INVALID",
  WORKFLOW_WORKSPACE_PRODUCT_NOT_FOUND: "WORKFLOW_WORKSPACE_PRODUCT_NOT_FOUND",
} as const;

export type WorkflowRuntimeErrorCode =
  (typeof WORKFLOW_RUNTIME_ERROR_CODES)[keyof typeof WORKFLOW_RUNTIME_ERROR_CODES];

export class SaasWorkflowRuntimeError extends Error {
  readonly code: WorkflowRuntimeErrorCode;

  constructor(code: WorkflowRuntimeErrorCode, message: string) {
    super(message);
    this.name = "SaasWorkflowRuntimeError";
    this.code = code;
  }
}

export function isSaasWorkflowRuntimeError(error: unknown): error is SaasWorkflowRuntimeError {
  return error instanceof SaasWorkflowRuntimeError;
}
