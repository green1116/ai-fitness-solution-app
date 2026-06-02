export const PRODUCT_PACKAGING_VERSION = "v8.1-product-packaging-1" as const;

export type ProductTier = "starter" | "professional" | "enterprise";

export type PricingModel = "custom";

export interface EntitlementLimits {
  planGeneration: number | "unlimited";
  budgetGeneration: number | "unlimited";
  proposalPdf: boolean;
  tenderPackage: boolean;
  workspaceLimit: number | "unlimited";
  userLimit: number | "unlimited";
  supportLevel: string;
  supportResponseHours: number | "unlimited";
}

export interface ProductDefinition {
  id: string;
  tier: ProductTier;
  name: string;
  tagline: string;
  description: string;
  entitlements: EntitlementLimits;
  pricingModel: PricingModel;
  pricingLabel: string;
}

export interface ProductFeature {
  id: string;
  key: string;
  label: string;
  description: string;
  category: "generation" | "export" | "collaboration" | "support";
  tiers: Record<ProductTier, boolean | number | "unlimited">;
}

export interface ProductPackagingProfile {
  profileId: string;
  tier: ProductTier;
  product: ProductDefinition;
  featureIds: string[];
  readyForSale: boolean;
  summary: string;
}

export interface ProductCatalog {
  version: typeof PRODUCT_PACKAGING_VERSION;
  catalogId: string;
  productName: string;
  products: ProductDefinition[];
  totalTiers: number;
  summary: string;
}

export interface FeatureMatrix {
  version: typeof PRODUCT_PACKAGING_VERSION;
  matrixId: string;
  features: ProductFeature[];
  tiers: ProductTier[];
  summary: string;
}

export interface PricingEntry {
  tier: ProductTier;
  model: PricingModel;
  label: string;
  displayPrice: string;
  note: string;
}

export interface PricingMatrix {
  version: typeof PRODUCT_PACKAGING_VERSION;
  matrixId: string;
  entries: PricingEntry[];
  summary: string;
}

export interface CommercialSummary {
  version: typeof PRODUCT_PACKAGING_VERSION;
  summaryId: string;
  productName: string;
  tiers: ProductTier[];
  pricingModel: PricingModel;
  catalogReady: boolean;
  packagingValid: boolean;
  summary: string;
}

export interface ProductPlansBundle {
  version: typeof PRODUCT_PACKAGING_VERSION;
  plansId: string;
  plans: ProductDefinition[];
  summary: string;
}

export interface ProductFeaturesBundle {
  version: typeof PRODUCT_PACKAGING_VERSION;
  featuresId: string;
  features: ProductFeature[];
  summary: string;
}

export interface ProductCatalogResponse {
  version: typeof PRODUCT_PACKAGING_VERSION;
  catalog: ProductCatalog;
  plans: ProductPlansBundle;
  features: ProductFeaturesBundle;
  commercialSummary: CommercialSummary;
}
