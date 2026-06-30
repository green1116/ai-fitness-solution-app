/**
 * V64 P1 — Commercial Productization Foundation types
 */
import type { FeatureMatrix, ProductCatalog, ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";
import type { FeatureKey } from "@/lib/feature-flags/feature.service";

export const V64_COMMERCIAL_FOUNDATION_VERSION = "v64-commercial-foundation-1" as const;

export type CommercialProductConfig = {
  version: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  configId: string;
  productName: string;
  catalog: ProductCatalog;
  tiers: ProductTier[];
  summary: string;
};

export type CommercialPricingEntry = {
  productTier: ProductTier;
  saasPlan: SaasPlan;
  catalogLabel: string;
  catalogDisplayPrice: string;
  monthlyPriceCny: number | null;
  billingNote: string;
};

export type CommercialPricingConfig = {
  version: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  configId: string;
  model: "custom" | "subscription";
  entries: CommercialPricingEntry[];
  summary: string;
};

export type CommercialFeatureMatrix = FeatureMatrix & {
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
};

export type PlanRegistryEntry = {
  planId: string;
  productTier: ProductTier;
  saasPlan: SaasPlan;
  userTier: UserTier;
  productName: string;
  subscriptionPlanId: string;
};

export type PlanRegistry = {
  version: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  registryId: string;
  plans: PlanRegistryEntry[];
  summary: string;
};

export type CapabilityBinding = {
  productFeatureKey: string;
  featureFlagKey: FeatureKey | null;
  usageType: "QUOTE" | "BUDGET" | "TENDER" | "PDF" | null;
  description: string;
};

export type TierCapabilityRow = {
  productTier: ProductTier;
  saasPlan: SaasPlan;
  userTier: UserTier;
  featureFlags: FeatureKey[];
  capabilities: CapabilityBinding[];
};

export type CapabilityMap = {
  version: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  mapId: string;
  tiers: TierCapabilityRow[];
  summary: string;
};

export type CommercialMetadata = {
  version: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  metadataId: string;
  productName: string;
  foundationReady: boolean;
  catalogReady: boolean;
  packagingValid: boolean;
  tierCount: number;
  capabilityBindings: number;
  backwardCompatible: {
    packagingVersion: string;
    packagingValid: boolean;
  };
  summary: string;
};

export type CommercialFoundation = {
  version: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  foundationId: string;
  productConfig: CommercialProductConfig;
  pricingConfig: CommercialPricingConfig;
  featureMatrix: CommercialFeatureMatrix;
  planRegistry: PlanRegistry;
  capabilityMap: CapabilityMap;
  commercialMetadata: CommercialMetadata;
};
