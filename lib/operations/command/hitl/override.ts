import type { CommandOverrideRecord, CommandReviewCase, CommandReviewTrail } from "./types";
import { appendReviewTrailRecord } from "./audit";
import { closeReviewCase } from "./review";

export function overrideCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  originalDecision: string;
  newDecision: string;
  reason: string;
}): { reviewCase: CommandReviewCase; override: CommandOverrideRecord; trail: CommandReviewTrail } {
  const override: CommandOverrideRecord = {
    overrideId: `override-${input.reviewCase.intentId}`,
    intentId: input.reviewCase.intentId,
    originalDecision: input.originalDecision,
    newDecision: input.newDecision,
    operator: input.operator,
    reason: input.reason,
    timestamp: new Date().toISOString(),
  };

  const reviewCase = closeReviewCase(
    input.reviewCase,
    "overridden",
    "override",
    `override:${input.reason}`,
  );

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "override",
    operator: input.operator,
    detail: `${input.originalDecision}->${input.newDecision}`,
    outcome: "pass",
  });

  return { reviewCase, override, trail };
}
