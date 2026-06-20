import type { BusinessEntryState } from "@/lib/workspace-business-runtime";
import type { QuoteBridgeView, QuoteReadiness } from "../bridge/quote-bridge-view";

export interface QuoteRuntimeContext {
  workspaceId: string;
  version: string;
  entryState: BusinessEntryState;
  surfaceEligible: boolean;
  surfaceVisible: boolean;
  surfaceActive: boolean;
  quoteReadiness: QuoteReadiness;
}

export function createQuoteRuntimeContext(bridgeView: QuoteBridgeView): QuoteRuntimeContext {
  return {
    workspaceId: bridgeView.workspaceId,
    version: bridgeView.version,
    entryState: bridgeView.entryState,
    surfaceEligible: bridgeView.surfaceEligible,
    surfaceVisible: bridgeView.surfaceVisible,
    surfaceActive: bridgeView.surfaceActive,
    quoteReadiness: bridgeView.quoteReadiness,
  };
}

export function describeQuoteRuntimeContext(context: QuoteRuntimeContext): string {
  return [
    `workspaceId=${context.workspaceId}`,
    `version=${context.version}`,
    `entryState=${context.entryState}`,
    `quoteReadiness=${context.quoteReadiness}`,
    `surfaceEligible=${context.surfaceEligible}`,
  ].join(" ");
}

export function assertQuoteRuntimeContextShape(context: QuoteRuntimeContext): boolean {
  return context.workspaceId.trim().length > 0 && context.version.trim().length > 0;
}
