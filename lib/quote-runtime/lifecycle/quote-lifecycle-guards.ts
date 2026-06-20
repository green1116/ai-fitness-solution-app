import {
  QUOTE_LIFECYCLE_FOUNDATION_PHASE_VALUES,
  QUOTE_LIFECYCLE_STATUS_VALUES,
  type QuoteLifecycleView,
} from "./quote-lifecycle-types";
import { resolveQuoteLifecycleStatus } from "./quote-lifecycle-state";

export function validateQuoteLifecycleView(view: QuoteLifecycleView): { valid: boolean; summary: string } {
  const valid =
    view.workspaceId.trim().length > 0 &&
    view.version.trim().length > 0 &&
    QUOTE_LIFECYCLE_FOUNDATION_PHASE_VALUES.includes(view.lifecyclePhase) &&
    QUOTE_LIFECYCLE_STATUS_VALUES.includes(view.lifecycleStatus) &&
    view.lifecycleStatus === resolveQuoteLifecycleStatus(view.lifecyclePhase);

  return {
    valid,
    summary: [
      `workspaceId=${view.workspaceId}`,
      `lifecyclePhase=${view.lifecyclePhase}`,
      `lifecycleStatus=${view.lifecycleStatus}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertQuoteLifecycleViewGuard(view: QuoteLifecycleView): boolean {
  return validateQuoteLifecycleView(view).valid;
}
