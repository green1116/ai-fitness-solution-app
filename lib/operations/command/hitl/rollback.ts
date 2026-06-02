import type { CommandReviewCase, CommandReviewTrail, CommandRollbackRequest } from "./types";
import { appendReviewTrailRecord } from "./audit";

export function requestCommandRollback(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  reason: string;
}): { request: CommandRollbackRequest; trail: CommandReviewTrail } {
  const request: CommandRollbackRequest = {
    requestId: `rollback-request-${input.reviewCase.intentId}`,
    intentId: input.reviewCase.intentId,
    operator: input.operator,
    reason: input.reason,
    status: "pending",
    timestamp: new Date().toISOString(),
  };

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "rollback-request",
    operator: input.operator,
    detail: input.reason,
    outcome: "pass",
  });

  return { request, trail };
}
