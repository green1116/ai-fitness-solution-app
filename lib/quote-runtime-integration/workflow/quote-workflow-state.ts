export const QUOTE_WORKFLOW_STATE_CREATED = "CREATED" as const;
export const QUOTE_WORKFLOW_STATE_PERSISTED = "PERSISTED" as const;
export const QUOTE_WORKFLOW_STATE_EXPOSED = "EXPOSED" as const;
export const QUOTE_WORKFLOW_STATE_FAILED = "FAILED" as const;

export type QuoteWorkflowState =
  | typeof QUOTE_WORKFLOW_STATE_CREATED
  | typeof QUOTE_WORKFLOW_STATE_PERSISTED
  | typeof QUOTE_WORKFLOW_STATE_EXPOSED
  | typeof QUOTE_WORKFLOW_STATE_FAILED;

export const QUOTE_WORKFLOW_STATE_VALUES: QuoteWorkflowState[] = [
  QUOTE_WORKFLOW_STATE_CREATED,
  QUOTE_WORKFLOW_STATE_PERSISTED,
  QUOTE_WORKFLOW_STATE_EXPOSED,
  QUOTE_WORKFLOW_STATE_FAILED,
];

export function isTerminalWorkflowState(state: QuoteWorkflowState): boolean {
  return state === QUOTE_WORKFLOW_STATE_EXPOSED || state === QUOTE_WORKFLOW_STATE_FAILED;
}

export function describeQuoteWorkflowState(state: QuoteWorkflowState): string {
  return `workflowState=${state}`;
}
