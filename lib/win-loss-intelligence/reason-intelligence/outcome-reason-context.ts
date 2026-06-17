import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { WLI_CANONICAL_ID } from "../shared/constants";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import { buildWinLossAnalyticsContext } from "../analytics/analytics-context";
import type { OutcomeReasonContext } from "./reason-types";

let cachedContext: OutcomeReasonContext | undefined;

export function buildOutcomeReasonContext(): OutcomeReasonContext {
  if (cachedContext) return cachedContext;

  const analytics = buildWinLossAnalyticsContext();

  cachedContext = {
    contextId: "wli-outcome-reason-context-v44-p3",
    outcomes: buildOutcomeRegistry().records,
    analytics,
    decisions: runProcurementDecisionEngine(),
    mode: WLI_CANONICAL_ID,
  };

  return cachedContext;
}
