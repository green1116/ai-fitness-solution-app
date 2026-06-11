import type { DIFFERENTIATION_BIDDER_BRANDS, PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export const BRAND_STRATEGY_RUNTIME_VERSION = "v19.2-brand-strategy-1" as const;

export interface BrandStrategyOption {
  strategyId: string;
  strategyType: "premium" | "balanced" | "value";
  label: string;
  focusBrands: string[];
  positioning: string;
  rationale: string;
}

export interface BrandStrategySnapshot {
  snapshotId: string;
  bidderBrand: (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];
  selectedStrategy: BrandStrategyOption;
  premiumStrategy: BrandStrategyOption;
  balancedStrategy: BrandStrategyOption;
  valueStrategy: BrandStrategyOption;
  strategyScore: number;
}

export interface BrandStrategyRuntimePayload {
  version: typeof BRAND_STRATEGY_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  snapshot: BrandStrategySnapshot;
  strategyScore: number;
  summary: string;
}
