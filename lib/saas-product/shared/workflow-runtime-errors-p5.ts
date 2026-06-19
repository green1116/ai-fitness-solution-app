export const WORKFLOW_P5_ERROR_CODES = {
  WORKFLOW_DEPENDENCY_NOT_SATISFIED: "WORKFLOW_DEPENDENCY_NOT_SATISFIED",
  WORKFLOW_BUSINESS_INVALID: "WORKFLOW_BUSINESS_INVALID",
} as const;

export type WorkflowP5ErrorCode = (typeof WORKFLOW_P5_ERROR_CODES)[keyof typeof WORKFLOW_P5_ERROR_CODES];

export class SaasWorkflowP5Error extends Error {
  readonly code: WorkflowP5ErrorCode;

  constructor(code: WorkflowP5ErrorCode, message: string) {
    super(message);
    this.name = "SaasWorkflowP5Error";
    this.code = code;
  }
}

export function isSaasWorkflowP5Error(error: unknown): error is SaasWorkflowP5Error {
  return error instanceof SaasWorkflowP5Error;
}
