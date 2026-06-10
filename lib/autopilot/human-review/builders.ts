import { WORKFLOW_STEPS } from "../workflow/types";
import type { ReviewDecision, ReviewGate } from "./types";

const REVIEW_RULES: Partial<Record<typeof WORKFLOW_STEPS[number], ReviewDecision>> = {
  "proposal-generation": "review-required",
  "proposal-pdf": "manual-review",
  "enterprise-zip": "manual-review",
};

export function buildReviewGates(input?: { deploymentId?: string }): ReviewGate[] {
  const deploymentId = input?.deploymentId ?? "review-default";
  return WORKFLOW_STEPS.map((stepId) => {
    const decision: ReviewDecision = REVIEW_RULES[stepId] ?? "auto-approved";
    return {
      gateId: `review-gate-${stepId}-${deploymentId}`,
      stepId,
      decision,
      reason:
        decision === "auto-approved"
          ? "低风险自动步骤，无需人工审核"
          : decision === "manual-review"
            ? "交付物步骤，建议人工抽检"
            : "方案内容步骤，需人工确认",
      requiresHuman: decision !== "auto-approved",
    };
  });
}

export function summarizeReviewGates(gates: ReviewGate[]): {
  autoApprovedCount: number;
  manualReviewCount: number;
  reviewRequiredCount: number;
} {
  return {
    autoApprovedCount: gates.filter((g) => g.decision === "auto-approved").length,
    manualReviewCount: gates.filter((g) => g.decision === "manual-review").length,
    reviewRequiredCount: gates.filter((g) => g.decision === "review-required").length,
  };
}

