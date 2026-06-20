import type { BusinessEntryState } from "@/lib/workspace-business-runtime";

export type QuoteReadiness = "READY" | "PARTIAL" | "BLOCKED";

export const QUOTE_READINESS_VALUES: QuoteReadiness[] = ["READY", "PARTIAL", "BLOCKED"];

export interface QuoteBridgeView {
  workspaceId: string;
  version: string;
  entryState: BusinessEntryState;
  quoteReadiness: QuoteReadiness;
  surfaceEligible: boolean;
  surfaceVisible: boolean;
  surfaceActive: boolean;
}
