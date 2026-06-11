import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const TECHNICAL_COMPOSER_RUNTIME_VERSION = "v19.4-technical-composer-1" as const;

export interface TechnicalProposalComposition {
  compositionId: string;
  proposalLabel: string;
  technicalScope: string;
  equipmentArchitecture: string;
  deploymentLogic: string;
  technicalReadiness: number;
}

export interface TechnicalComposerRuntimePayload {
  version: typeof TECHNICAL_COMPOSER_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  composition: TechnicalProposalComposition;
  technicalReadiness: number;
  summary: string;
}
