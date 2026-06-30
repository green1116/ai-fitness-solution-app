/**
 * V64 P5 — Commercial product catalog layer types
 */
import type {
  ProductCatalogResponse,
  ProductDefinition,
  ProductPackagingProfile,
  ProductTier,
} from "@/lib/productization/catalog";
import { PRODUCT_PACKAGING_VERSION } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";

import type { TierCapabilityAggregate } from "./capability.types";
import type { CommercialCapabilitySnapshot } from "./capability.types";
import type { CommercialFeatureMatrixSnapshot } from "./feature.types";
import type { NormalizedPlanPrice } from "./pricing.types";
import type { CommercialPricingSnapshot } from "./pricing.types";
import type { PlanRegistryEntry } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export const V64_CATALOG_LAYER_VERSION = "v64-catalog-layer-1" as const;

export type TierCatalogEntry = {
  productTier: ProductTier;
  saasPlan: SaasPlan;
  product: ProductDefinition;
  plan: PlanRegistryEntry;
  normalizedPrice: NormalizedPlanPrice;
  capability: TierCapabilityAggregate;
  packagingProfile: ProductPackagingProfile;
};

export type CommercialProductCatalogBundle = {
  version: typeof V64_CATALOG_LAYER_VERSION;
  catalogId: string;
  productName: string;
  tierEntries: TierCatalogEntry[];
  pricingSnapshot: CommercialPricingSnapshot;
  featureSnapshot: CommercialFeatureMatrixSnapshot;
  capabilitySnapshot: CommercialCapabilitySnapshot;
  summary: string;
};

export type TierCatalogSnapshot = {
  version: typeof V64_CATALOG_LAYER_VERSION;
  snapshotId: string;
  generatedAt: string;
  bundle: CommercialProductCatalogBundle;
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  packagingVersion: typeof PRODUCT_PACKAGING_VERSION;
  summary: string;
};

export type CommercialCatalogExport = {
  version: typeof V64_CATALOG_LAYER_VERSION;
  exportId: string;
  exportedAt: string;
  bundle: CommercialProductCatalogBundle;
  legacyCatalogResponse: ProductCatalogResponse;
  backwardCompatible: {
    packagingVersion: typeof PRODUCT_PACKAGING_VERSION;
    packagingValid: boolean;
  };
  summary: string;
};

export type CommercialCatalogValidation = {
  tierEntriesOk: boolean;
  productsOk: boolean;
  plansOk: boolean;
  pricingOk: boolean;
  capabilityOk: boolean;
  featureOk: boolean;
  packagingOk: boolean;
  backwardCompatible: boolean;
  catalogOk: boolean;
};
