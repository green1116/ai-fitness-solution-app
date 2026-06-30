/**
 * V64 P3 — Commercial feature matrix layer types
 */
import type { ProductFeature, ProductTier } from "@/lib/productization/catalog";
import type { BillingEntitlement } from "@/lib/productization/billing/types";
import type { FeatureKey, UsageLimitConfig } from "@/lib/feature-flags/feature.service";
import type { SaasPlan } from "@/lib/saas/types";

import type { CommercialFeatureMatrix } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export const V64_FEATURE_MATRIX_LAYER_VERSION = "v64-feature-matrix-layer-1" as const;

export type PlanFeatureMapping = {
  planId: string;
  productTier: ProductTier;
  saasPlan: SaasPlan;
  productName: string;
  featureIds: string[];
  featureKeys: string[];
  /** Runtime gate keys enabled for this plan (read from PLAN_FEATURE_MATRIX) */
  runtimeFeatureFlags: FeatureKey[];
};

export type TierEntitlementMapping = {
  productTier: ProductTier;
  saasPlan: SaasPlan;
  entitlementId: string;
  billingEntitlement: BillingEntitlement;
  catalogFeatures: ProductFeature[];
  usageLimits: UsageLimitConfig;
};

export type ExposedCapability = {
  productFeatureKey: string;
  featureFlagKey: FeatureKey | null;
  usageType: "QUOTE" | "BUDGET" | "TENDER" | "PDF" | null;
  commercialLabel: string;
  enabledByTier: Record<ProductTier, boolean>;
};

export type CommercialFeatureGatingMatrix = {
  version: typeof V64_FEATURE_MATRIX_LAYER_VERSION;
  matrixId: string;
  catalogMatrix: CommercialFeatureMatrix;
  planFeatureMap: PlanFeatureMapping[];
  tierEntitlements: TierEntitlementMapping[];
  exposedCapabilities: ExposedCapability[];
  summary: string;
};

export type CommercialFeatureMatrixSnapshot = {
  version: typeof V64_FEATURE_MATRIX_LAYER_VERSION;
  snapshotId: string;
  generatedAt: string;
  gatingMatrix: CommercialFeatureGatingMatrix;
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  summary: string;
};

export type CommercialFeatureMatrixValidation = {
  catalogMatrixOk: boolean;
  planFeatureMapOk: boolean;
  tierEntitlementsOk: boolean;
  capabilitiesExposedOk: boolean;
  runtimeMatrixAligned: boolean;
  backwardCompatible: boolean;
  featureMatrixOk: boolean;
};
