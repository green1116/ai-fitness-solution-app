import type { CommandReviewCase, CommandReviewTrail, CommandSuspensionRecord } from "./types";
import { appendReviewTrailRecord } from "./audit";
import { closeReviewCase } from "./review";

export function suspendCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  reason: string;
  until?: string | null;
}): { reviewCase: CommandReviewCase; suspension: CommandSuspensionRecord; trail: CommandReviewTrail } {
  const suspension: CommandSuspensionRecord = {
    suspensionId: `suspend-${input.reviewCase.intentId}`,
    intentId: input.reviewCase.intentId,
    operator: input.operator,
    reason: input.reason,
    until: input.until ?? null,
    timestamp: new Date().toISOString(),
  };

  const reviewCase = closeReviewCase(input.reviewCase, "suspended", "suspend", input.reason);

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "suspend",
    operator: input.operator,
    detail: input.reason,
    outcome: "pass",
  });

  return { reviewCase, suspension, trail };
}
