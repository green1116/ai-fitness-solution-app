import type { WLI_CANONICAL_ID } from "../shared/constants";
import type { TenderOutcome, TenderOutcomeStatus } from "../shared/types";
import type { ProcurementDecisionRecord } from "@/lib/procurement-intelligence";
import type { WinLossAnalyticsContext } from "../analytics/analytics-types";

export type ReasonCategory =
  | "brand"
  | "product"
  | "supplier"
  | "procurement"
  | "decision";

export interface OutcomeReason {
  tenderId: string;
  outcome: TenderOutcomeStatus;
  reasonCategory: ReasonCategory;
  reasonCode: string;
  reasonWeight: number;
  reasonText: string;
}

export interface RootCauseAnalysis {
  tenderId: string;
  outcome: TenderOutcomeStatus;
  topReasons: string[];
  rootCause: string;
  confidence: number;
}

export interface OutcomeReasonContext {
  contextId: string;
  outcomes: TenderOutcome[];
  analytics: WinLossAnalyticsContext;
  decisions: ProcurementDecisionRecord[];
  mode: typeof WLI_CANONICAL_ID;
}

export interface ReasonIntelligenceValidation {
  valid: boolean;
  brandReasonReady: boolean;
  productReasonReady: boolean;
  supplierReasonReady: boolean;
  procurementReasonReady: boolean;
  rootCauseReady: boolean;
  reasonCount: number;
  rootCauseCount: number;
  summary: string;
}
