export const BIDDER_PROPOSAL_COMPOSER_VERSION = "v19.4-bidder-proposal-composer-1" as const;

export type ComposerStatus = "success" | "failed";

export type ComposerStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export const COMPOSER_BIDDER_BRANDS = [
  "Technogym",
  "Life Fitness",
  "Matrix",
  "Shuhua",
] as const;

export type ComposerBidderBrand = (typeof COMPOSER_BIDDER_BRANDS)[number];

export const PROPOSAL_VARIANT_LABELS: Record<ComposerBidderBrand, string> = {
  Technogym: "Proposal A",
  "Life Fitness": "Proposal B",
  Matrix: "Proposal C",
  Shuhua: "Proposal D",
};

export interface ComposerStageResult {
  stageId: string;
  label: string;
  status: ComposerStageStatus;
  durationMs: number;
  message: string;
}

export interface ComposerRuntimeResult<TPayload> {
  version: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  runtimeId: string;
  domain: string;
  status: ComposerStatus;
  stages: ComposerStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface BidderProposalComposerEvidence {
  evidenceId: string;
  version: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: ComposerStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface BidderProposalComposerReport {
  version: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  reportId: string;
  deploymentId: string;
  tenderId: string;
  proposalDifferentiationScore: number;
  brandAlignmentScore: number;
  equipmentAlignmentScore: number;
  budgetAlignmentScore: number;
  proposalSummaries: Array<{
    proposalLabel: string;
    bidderBrand: string;
    packageLabel: string;
    executiveHeadline: string;
    budgetTotal: number;
    qualityScore: number;
  }>;
  summary: string;
  generatedAt: string;
}
