export const PROPOSAL_DELIVERY_PACKAGING_VERSION = "v19.5-proposal-delivery-packaging-1" as const;

export type PackagingStatus = "success" | "failed";

export type PackagingStageStatus = "completed" | "failed";

export const PACKAGING_BIDDER_BRANDS = [
  "Technogym",
  "Life Fitness",
  "Matrix",
  "Shuhua",
] as const;

export type PackagingBidderBrand = (typeof PACKAGING_BIDDER_BRANDS)[number];

export const PACKAGING_PROPOSAL_LABELS: Record<PackagingBidderBrand, string> = {
  Technogym: "Proposal A",
  "Life Fitness": "Proposal B",
  Matrix: "Proposal C",
  Shuhua: "Proposal D",
};

export type PackagingStrategyTier = "premium" | "balanced" | "value";

export const BRAND_STRATEGY_TIER: Record<PackagingBidderBrand, PackagingStrategyTier> = {
  Technogym: "premium",
  "Life Fitness": "premium",
  Matrix: "balanced",
  Shuhua: "value",
};

export interface PackagingStageResult {
  stageId: string;
  label: string;
  status: PackagingStageStatus;
  durationMs: number;
  message: string;
}

export interface PackagingRuntimeResult<TPayload> {
  version: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  runtimeId: string;
  domain: string;
  status: PackagingStatus;
  stages: PackagingStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface ProposalDeliveryPackagingEvidence {
  evidenceId: string;
  version: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: PackagingStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface ProposalDeliveryPackagingReport {
  version: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  reportId: string;
  deploymentId: string;
  tenderId: string;
  budgetAlignmentScore: number;
  deliveryReadinessScore: number;
  lifecycleCostProfiles: Array<{
    proposalLabel: string;
    bidderBrand: string;
    acquisitionCost: number;
    maintenanceCost: number;
    replacementCost: number;
    totalLifecycleCost: number;
  }>;
  maintenanceNarratives: Array<{
    proposalLabel: string;
    bidderBrand: string;
    serviceCoverage: string;
    supportReadiness: number;
  }>;
  roiNarratives: Array<{
    proposalLabel: string;
    bidderBrand: string;
    investmentLogic: string;
    businessValue: string;
  }>;
  tcoProfiles: Array<{
    proposalLabel: string;
    bidderBrand: string;
    acquisition: number;
    operation: number;
    maintenance: number;
    replacement: number;
    totalTCO: number;
  }>;
  summary: string;
  generatedAt: string;
}
