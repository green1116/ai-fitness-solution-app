import type { BusinessSurfaceView, WorkspaceBusinessEntry } from "@/lib/workspace-business-runtime";
import type { QuoteBridgeView, QuoteReadiness } from "./quote-bridge-view";
import { QUOTE_READINESS_VALUES } from "./quote-bridge-view";

export function resolveQuoteReadiness(
  entry: WorkspaceBusinessEntry,
  quoteSurface: BusinessSurfaceView,
): QuoteReadiness {
  if (entry.entryState === "DISABLED" || !quoteSurface.eligible) {
    return "BLOCKED";
  }
  if (entry.entryState === "ACTIVE" && quoteSurface.active) {
    return "READY";
  }
  if (entry.entryState === "DRAFT" || !quoteSurface.active) {
    return "PARTIAL";
  }
  return "BLOCKED";
}

export function describeQuoteBridgeView(view: QuoteBridgeView): string {
  return [
    `workspaceId=${view.workspaceId}`,
    `version=${view.version}`,
    `entryState=${view.entryState}`,
    `quoteReadiness=${view.quoteReadiness}`,
    `surfaceEligible=${view.surfaceEligible}`,
    `surfaceVisible=${view.surfaceVisible}`,
    `surfaceActive=${view.surfaceActive}`,
  ].join(" ");
}

export function assertQuoteBridgeViewShape(view: QuoteBridgeView): boolean {
  if (view.workspaceId.trim().length === 0) {
    return false;
  }
  if (view.version.trim().length === 0) {
    return false;
  }
  if (!QUOTE_READINESS_VALUES.includes(view.quoteReadiness)) {
    return false;
  }
  return true;
}
