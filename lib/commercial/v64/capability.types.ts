/**
 * V64 P4 — Commercial capability layer types
 */
import type { FeatureKey, UsageLimitConfig } from "@/lib/feature-flags/feature.service";
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";

import type { CapabilityMap } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";
import type { ExposedCapability } from "./feature.types";

export const V64_CAPABILITY_LAYER_VERSION = "v64-capability-layer-1" as const;

export type TierCapabilityAggregate = {
  productTier: ProductTier;
  saasPlan: SaasPlan;
  userTier: UserTier;
  planId: string;
  productName: string;
  featureFlags: FeatureKey[];
  usageLimits: UsageLimitConfig;
  enabledCapabilities: ExposedCapability[];
  enabledCapabilityCount: number;
};

export type CommercialCapabilityBundle = {
  version: typeof V64_CAPABILITY_LAYER_VERSION;
  bundleId: string;
  foundationMap: CapabilityMap;
  tierAggregates: TierCapabilityAggregate[];
  allExposedCapabilities: ExposedCapability[];
  summary: string;
};

export type CommercialCapabilitySnapshot = {
  version: typeof V64_CAPABILITY_LAYER_VERSION;
  snapshotId: string;
  generatedAt: string;
  bundle: CommercialCapabilityBundle;
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  summary: string;
};

export type CommercialCapabilityValidation = {
  foundationMapOk: boolean;
  tierAggregatesOk: boolean;
  exposureOk: boolean;
  runtimeAligned: boolean;
  backwardCompatible: boolean;
  capabilityOk: boolean;
};
