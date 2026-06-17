import type { WLI_CANONICAL_ID } from "../shared/constants";
import type { TenderOutcome, TenderOutcomeStatus } from "../shared/types";

export type { TenderOutcome, TenderOutcomeStatus };

export interface OutcomeRegistry {
  registryId: string;
  records: TenderOutcome[];
  count: number;
  mode: typeof WLI_CANONICAL_ID;
}

export interface WinLossFoundationValidation {
  valid: boolean;
  outcomeRegistryReady: boolean;
  winCount: number;
  lossCount: number;
  pendingCount: number;
  outcomeCount: number;
  summary: string;
}
