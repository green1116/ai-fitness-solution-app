import type { CommandCancellationRecord, CommandReviewCase, CommandReviewTrail } from "./types";
import { appendReviewTrailRecord } from "./audit";
import { closeReviewCase } from "./review";

export function cancelCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  reason: string;
}): { reviewCase: CommandReviewCase; cancellation: CommandCancellationRecord; trail: CommandReviewTrail } {
  const cancellation: CommandCancellationRecord = {
    cancellationId: `cancel-${input.reviewCase.intentId}`,
    intentId: input.reviewCase.intentId,
    operator: input.operator,
    reason: input.reason,
    timestamp: new Date().toISOString(),
  };

  const reviewCase = closeReviewCase(input.reviewCase, "cancelled", "cancel", input.reason);

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "cancel",
    operator: input.operator,
    detail: input.reason,
    outcome: "pass",
  });

  return { reviewCase, cancellation, trail };
}
