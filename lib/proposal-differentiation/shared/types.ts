export const PROPOSAL_DIFFERENTIATION_VERSION = "v19.2-proposal-differentiation-1" as const;

export type DifferentiationStatus = "success" | "failed";

export type DifferentiationStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export const DIFFERENTIATION_BIDDER_BRANDS = [
  "Technogym",
  "Life Fitness",
  "Matrix",
  "Shuhua",
] as const;

export type DifferentiationBidderBrand = (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];

export interface DifferentiationStageResult {
  stageId: string;
  label: string;
  status: DifferentiationStageStatus;
  durationMs: number;
  message: string;
}

export interface DifferentiationRuntimeResult<TPayload> {
  version: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  runtimeId: string;
  domain: string;
  status: DifferentiationStatus;
  stages: DifferentiationStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface ProposalDifferentiationEvidence {
  evidenceId: string;
  version: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: DifferentiationStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface ProposalDifferentiationReport {
  version: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  reportId: string;
  deploymentId: string;
  tenderId: string;
  brandDifferentiation: number;
  budgetDifferentiation: number;
  equipmentDifferentiation: number;
  proposalDifferentiationScore: number;
  proposalVariants: Array<{
    bidderBrand: string;
    proposalLabel: string;
    differentiationScore: number;
  }>;
  summary: string;
  generatedAt: string;
}
