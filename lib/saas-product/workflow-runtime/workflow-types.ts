export const QUOTE_WORKFLOW_STATES = ["draft", "estimating", "review", "approved", "released"] as const;
export type QuoteWorkflowState = (typeof QUOTE_WORKFLOW_STATES)[number];

export const QUOTE_WORKFLOW_TRANSITIONS: Record<QuoteWorkflowState, QuoteWorkflowState[]> = {
  draft: ["estimating"],
  estimating: ["review"],
  review: ["approved"],
  approved: ["released"],
  released: [],
};

export const RESERVED_WORKFLOW_TYPES = ["APPROVAL", "DELIVERY", "RELEASE"] as const;
