import type { DIFFERENTIATION_BIDDER_BRANDS, PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export const VALUE_PROPOSITION_RUNTIME_VERSION = "v19.2-value-proposition-1" as const;

export interface ValuePropositionSnapshot {
  snapshotId: string;
  bidderBrand: (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];
  coreValue: string;
  differentiationMessage: string;
  competitivePosition: string;
  keyBenefits: string[];
  propositionScore: number;
}

export interface ValuePropositionRuntimePayload {
  version: typeof VALUE_PROPOSITION_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  snapshot: ValuePropositionSnapshot;
  propositionScore: number;
  summary: string;
}
