import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const EXECUTIVE_COMPOSER_RUNTIME_VERSION = "v19.4-executive-composer-1" as const;

export interface ExecutiveSummaryComposition {
  compositionId: string;
  proposalLabel: string;
  style: "premium" | "balanced" | "value";
  executiveSummary: string;
  coreValue: string;
  strategicPosition: string;
  executiveReadiness: number;
}

export interface ExecutiveComposerRuntimePayload {
  version: typeof EXECUTIVE_COMPOSER_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  composition: ExecutiveSummaryComposition;
  executiveReadiness: number;
  summary: string;
}
