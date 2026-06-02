import type { CommandEscalationRecord, CommandReviewCase, CommandReviewTrail } from "./types";
import { appendReviewTrailRecord } from "./audit";
import { closeReviewCase } from "./review";

export function escalateCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  fromLevel: number;
  toLevel: number;
  reason: string;
}): { reviewCase: CommandReviewCase; escalation: CommandEscalationRecord; trail: CommandReviewTrail } {
  const escalation: CommandEscalationRecord = {
    escalationId: `escalate-${input.reviewCase.intentId}`,
    intentId: input.reviewCase.intentId,
    fromLevel: input.fromLevel,
    toLevel: input.toLevel,
    operator: input.operator,
    reason: input.reason,
    timestamp: new Date().toISOString(),
  };

  const reviewCase = closeReviewCase(input.reviewCase, "escalated", "escalate", input.reason);

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "escalate",
    operator: input.operator,
    detail: `level ${input.fromLevel}->${input.toLevel}`,
    outcome: "pass",
  });

  return { reviewCase, escalation, trail };
}
