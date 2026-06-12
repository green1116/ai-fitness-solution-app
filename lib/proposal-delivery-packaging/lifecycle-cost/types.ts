import type { PROPOSAL_DELIVERY_PACKAGING_VERSION, PackagingStrategyTier } from "../shared/types";

export const LIFECYCLE_COST_RUNTIME_VERSION = "v19.5-lifecycle-cost-1" as const;

export interface LifecycleCostProfile {
  profileId: string;
  proposalLabel: string;
  bidderBrand: string;
  strategyTier: PackagingStrategyTier;
  acquisitionCost: number;
  maintenanceCost: number;
  replacementCost: number;
  totalLifecycleCost: number;
  lifecycleReadiness: number;
}

export interface LifecycleCostRuntimePayload {
  version: typeof LIFECYCLE_COST_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  profile: LifecycleCostProfile;
  lifecycleReadiness: number;
  summary: string;
}
