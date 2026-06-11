import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const PROPOSAL_QUALITY_RUNTIME_VERSION = "v19.4-proposal-quality-1" as const;

export interface ProposalQualityAssessment {
  assessmentId: string;
  proposalLabel: string;
  bidderBrand: string;
  completeness: number;
  consistency: number;
  differentiation: number;
  bidderAlignment: number;
  brandAlignment: number;
  equipmentAlignment: number;
  budgetAlignment: number;
  qualityScore: number;
}

export interface ProposalQualityRuntimePayload {
  version: typeof PROPOSAL_QUALITY_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  assessments: ProposalQualityAssessment[];
  averageQualityScore: number;
  qualityReadiness: number;
  summary: string;
}
