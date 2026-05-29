import type { CommandReviewCase, CommandReviewTrail } from "./types";
import { appendReviewTrailRecord } from "./audit";
import { closeReviewCase } from "./review";

export function approveCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  reason?: string;
}): { reviewCase: CommandReviewCase; trail: CommandReviewTrail } {
  const reviewCase = closeReviewCase(
    input.reviewCase,
    "approved",
    "approve",
    input.reason ?? "human-approved",
  );

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "approve",
    operator: input.operator,
    detail: input.reason ?? "approved",
    outcome: "pass",
  });

  return { reviewCase, trail };
}

export function rejectCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  reason: string;
}): { reviewCase: CommandReviewCase; trail: CommandReviewTrail } {
  const reviewCase = closeReviewCase(input.reviewCase, "rejected", "reject", input.reason);

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "reject",
    operator: input.operator,
    detail: input.reason,
    outcome: "fail",
  });

  return { reviewCase, trail };
}

export function confirmCommand(input: {
  reviewCase: CommandReviewCase;
  trail: CommandReviewTrail;
  operator: string;
  reason?: string;
}): { reviewCase: CommandReviewCase; trail: CommandReviewTrail } {
  const reviewCase = closeReviewCase(
    input.reviewCase,
    "approved",
    "confirm",
    input.reason ?? "human-confirmed",
  );

  const trail = appendReviewTrailRecord({
    trail: input.trail,
    intentId: input.reviewCase.intentId,
    action: "confirm",
    operator: input.operator,
    detail: input.reason ?? "confirmed",
    outcome: "pass",
  });

  return { reviewCase, trail };
}
