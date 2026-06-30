/**
 * V64 P6 — Commercial plan transition layer types
 */
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";

import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export const V64_TRANSITION_LAYER_VERSION = "v64-transition-layer-1" as const;

export type PlanTransitionKind = "upgrade" | "downgrade";

export type PlanTransitionPath = {
  fromProductTier: ProductTier;
  toProductTier: ProductTier;
  fromSaasPlan: SaasPlan;
  toSaasPlan: SaasPlan;
  kind: PlanTransitionKind;
  rankDelta: number;
  monthlyPriceDeltaCny: number;
  gainedFeatureFlags: FeatureKey[];
  lostFeatureFlags: FeatureKey[];
  message: string;
};

export type TierCompatibilityKind = "same" | PlanTransitionKind | "blocked";

export type TierCompatibilityCell = {
  fromTier: ProductTier;
  toTier: ProductTier;
  allowed: boolean;
  kind: TierCompatibilityKind;
};

export type TierCompatibilityMatrix = {
  version: typeof V64_TRANSITION_LAYER_VERSION;
  matrixId: string;
  tiers: ProductTier[];
  cells: TierCompatibilityCell[];
  summary: string;
};

export type CommercialTransitionBundle = {
  version: typeof V64_TRANSITION_LAYER_VERSION;
  bundleId: string;
  upgradePaths: PlanTransitionPath[];
  downgradePaths: PlanTransitionPath[];
  compatibilityMatrix: TierCompatibilityMatrix;
  summary: string;
};

export type CommercialTransitionSnapshot = {
  version: typeof V64_TRANSITION_LAYER_VERSION;
  snapshotId: string;
  generatedAt: string;
  bundle: CommercialTransitionBundle;
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  summary: string;
};

export type CommercialTransitionValidation = {
  upgradePathsOk: boolean;
  downgradePathsOk: boolean;
  compatibilityOk: boolean;
  runtimeAligned: boolean;
  backwardCompatible: boolean;
  transitionOk: boolean;
};
