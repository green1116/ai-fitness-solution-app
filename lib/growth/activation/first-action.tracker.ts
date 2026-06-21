/**
 * V60 P1 — First action tracking (activation milestones)
 */

import { advanceOnboardingStep } from "./onboarding.flow";
import { appendGrowthEvent, getGrowthEventsSnapshot } from "../growth.events.store";

export type FirstActionType = "project" | "quote" | "budget" | "tender" | "pdf";

const EVENT_BY_ACTION: Record<FirstActionType, string> = {
  project: "project.created",
  quote: "quote.generated",
  budget: "budget.calculated",
  tender: "tender.generated",
  pdf: "quote.generated",
};

export function trackFirstAction(input: {
  userId: string;
  organizationId: string;
  action: FirstActionType;
  resourceId?: string;
}) {
  appendGrowthEvent({
    event: EVENT_BY_ACTION[input.action],
    userId: input.userId,
    organizationId: input.organizationId,
    meta: { firstAction: input.action, resourceId: input.resourceId, isFirst: true },
  });

  if (input.action === "project") {
    advanceOnboardingStep(input.userId, "create_first_project", input.organizationId);
  }
  if (input.action === "quote") {
    advanceOnboardingStep(input.userId, "generate_first_quote", input.organizationId);
    advanceOnboardingStep(input.userId, "show_value_output", input.organizationId);
  }
}

export function hasFirstQuote(organizationId: string): boolean {
  return getGrowthEventsSnapshot().some(
    (e) =>
      e.organizationId === organizationId &&
      e.event === "quote.generated" &&
      (e.meta as { isFirst?: boolean } | undefined)?.isFirst === true,
  );
}
