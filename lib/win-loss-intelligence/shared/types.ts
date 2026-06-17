import type { WLI_P1_PHASE, WLI_P1_TAG } from "./constants";

export type TenderOutcomeStatus = "win" | "loss" | "pending";

export interface TenderOutcome {
  tenderId: string;
  decisionId: string;
  outcome: TenderOutcomeStatus;
  reasonCodes: string[];
  confidence: number;
}

export interface WinLossIntelligencePhase1FreezeMeta {
  tag: typeof WLI_P1_TAG;
  version: typeof WLI_P1_TAG;
  phase: typeof WLI_P1_PHASE;
  valid: boolean;
}
