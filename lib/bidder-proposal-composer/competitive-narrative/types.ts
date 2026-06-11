import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const COMPETITIVE_NARRATIVE_COMPOSER_RUNTIME_VERSION = "v19.4-competitive-narrative-composer-1" as const;

export interface CompetitiveNarrativeComposition {
  compositionId: string;
  proposalLabel: string;
  competitiveAdvantage: string;
  brandAdvantage: string;
  serviceAdvantage: string;
  deliveryAdvantage: string;
  differentiationReadiness: number;
}

export interface CompetitiveNarrativeComposerRuntimePayload {
  version: typeof COMPETITIVE_NARRATIVE_COMPOSER_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  composition: CompetitiveNarrativeComposition;
  differentiationReadiness: number;
  summary: string;
}
