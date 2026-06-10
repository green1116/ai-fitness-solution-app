import type { AUTOPILOT_VERSION } from "../shared/types";
import type { WorkflowStepId } from "../workflow/types";

export const HUMAN_REVIEW_RUNTIME_VERSION = "v13.5-human-review-1" as const;

export const REVIEW_DECISIONS = [
  "auto-approved",
  "manual-review",
  "review-required",
] as const;

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export interface ReviewGate {
  gateId: string;
  stepId: WorkflowStepId;
  decision: ReviewDecision;
  reason: string;
  requiresHuman: boolean;
}

export interface HumanReviewRuntimePayload {
  version: typeof HUMAN_REVIEW_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  gates: ReviewGate[];
  autoApprovedCount: number;
  manualReviewCount: number;
  reviewRequiredCount: number;
  summary: string;
}
