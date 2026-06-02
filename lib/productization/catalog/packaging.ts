import { getFeatureIdsForTier, buildProductFeatures } from "./features";
import { buildProductPlans } from "./plans";
import { buildPricingMatrix } from "./pricing";
import type {
  CommercialSummary,
  FeatureMatrix,
  ProductCatalog,
  ProductCatalogResponse,
  ProductFeaturesBundle,
  ProductPackagingProfile,
  ProductPlansBundle,
  ProductTier,
} from "./types";
import { PRODUCT_PACKAGING_VERSION } from "./types";

const PRODUCT_NAME = "AI Fitness Solution";
const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

export function buildProductCatalog(input?: { deploymentId?: string }): ProductCatalog {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const products = buildProductPlans();
  return {
    version: PRODUCT_PACKAGING_VERSION,
    catalogId: `product-catalog-${deploymentId}`,
    productName: PRODUCT_NAME,
    products,
    totalTiers: products.length,
    summary: `product-catalog name=${PRODUCT_NAME} tiers=${products.length}`,
  };
}

export function buildPackagingProfile(
  tier: ProductTier,
  input?: { deploymentId?: string },
): ProductPackagingProfile {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const product = buildProductPlans().find((p) => p.tier === tier);
  if (!product) {
    throw new Error(`Unknown product tier: ${tier}`);
  }
  const featureIds = getFeatureIdsForTier(tier);
  return {
    profileId: `packaging-profile-${tier}-${deploymentId}`,
    tier,
    product,
    featureIds,
    readyForSale: true,
    summary: `packaging-profile tier=${tier} features=${featureIds.length} readyForSale=true`,
  };
}

export function buildFeatureMatrix(input?: { deploymentId?: string }): FeatureMatrix {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const features = buildProductFeatures();
  return {
    version: PRODUCT_PACKAGING_VERSION,
    matrixId: `feature-matrix-${deploymentId}`,
    features,
    tiers: [...ALL_TIERS],
    summary: `feature-matrix features=${features.length} tiers=${ALL_TIERS.length}`,
  };
}

export function buildCommercialSummary(input?: { deploymentId?: string }): CommercialSummary {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const catalog = buildProductCatalog({ deploymentId });
  const profiles = ALL_TIERS.map((tier) => buildPackagingProfile(tier, { deploymentId }));
  const packagingValid = profiles.every((p) => p.readyForSale && p.featureIds.length > 0);

  return {
    version: PRODUCT_PACKAGING_VERSION,
    summaryId: `commercial-summary-${deploymentId}`,
    productName: PRODUCT_NAME,
    tiers: [...ALL_TIERS],
    pricingModel: "custom",
    catalogReady: catalog.products.length === 3,
    packagingValid,
    summary: [
      `commercial-summary product=${PRODUCT_NAME}`,
      `tiers=${ALL_TIERS.join(",")}`,
      `pricingModel=custom`,
      `catalogReady=${catalog.products.length === 3}`,
      `packagingValid=${packagingValid}`,
    ].join(" "),
  };
}

export function buildProductPlansBundle(input?: { deploymentId?: string }): ProductPlansBundle {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const plans = buildProductPlans();
  return {
    version: PRODUCT_PACKAGING_VERSION,
    plansId: `product-plans-${deploymentId}`,
    plans,
    summary: `product-plans count=${plans.length}`,
  };
}

export function buildProductFeaturesBundle(input?: { deploymentId?: string }): ProductFeaturesBundle {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const features = buildProductFeatures();
  return {
    version: PRODUCT_PACKAGING_VERSION,
    featuresId: `product-features-${deploymentId}`,
    features,
    summary: `product-features count=${features.length}`,
  };
}

export function buildProductCatalogResponse(input?: {
  deploymentId?: string;
}): ProductCatalogResponse {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  return {
    version: PRODUCT_PACKAGING_VERSION,
    catalog: buildProductCatalog({ deploymentId }),
    plans: buildProductPlansBundle({ deploymentId }),
    features: buildProductFeaturesBundle({ deploymentId }),
    commercialSummary: buildCommercialSummary({ deploymentId }),
  };
}

export function validatePackaging(input?: { deploymentId?: string }): {
  catalogExists: boolean;
  plansExist: boolean;
  featuresMapped: boolean;
  packagingValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "product-packaging-default";
  const catalog = buildProductCatalog({ deploymentId });
  const matrix = buildFeatureMatrix({ deploymentId });
  const summary = buildCommercialSummary({ deploymentId });
  const profiles = ALL_TIERS.map((tier) => buildPackagingProfile(tier, { deploymentId }));

  const catalogExists = catalog.products.length > 0;
  const plansExist = catalog.products.length === 3;
  const featuresMapped = matrix.features.length >= 7 && profiles.every((p) => p.featureIds.length > 0);
  const packagingValid = summary.packagingValid && summary.catalogReady;

  return { catalogExists, plansExist, featuresMapped, packagingValid };
}

// Re-export pricing for convenience
export { buildPricingMatrix } from "./pricing";
