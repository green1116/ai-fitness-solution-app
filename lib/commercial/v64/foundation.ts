/**
 * V64 P1 — Commercial Productization Foundation (single entry)
 */
import { buildCapabilityMap } from "./capability.map";
import { buildCommercialMetadata } from "./commercial.metadata";
import { buildCommercialFeatureMatrix } from "./feature.matrix";
import { buildPlanRegistry } from "./plan.registry";
import { buildCommercialPricingConfig } from "./pricing.config";
import { buildCommercialProductConfig } from "./product.config";
import type { CommercialFoundation } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialFoundation(input?: {
  deploymentId?: string;
}): CommercialFoundation {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  return {
    version: V64_COMMERCIAL_FOUNDATION_VERSION,
    foundationId: `commercial-foundation-${deploymentId}`,
    productConfig: buildCommercialProductConfig({ deploymentId }),
    pricingConfig: buildCommercialPricingConfig({ deploymentId }),
    featureMatrix: buildCommercialFeatureMatrix({ deploymentId }),
    planRegistry: buildPlanRegistry({ deploymentId }),
    capabilityMap: buildCapabilityMap({ deploymentId }),
    commercialMetadata: buildCommercialMetadata({ deploymentId }),
  };
}

export function validateCommercialFoundation(input?: { deploymentId?: string }): {
  productConfigOk: boolean;
  pricingConfigOk: boolean;
  featureMatrixOk: boolean;
  planRegistryOk: boolean;
  capabilityMapOk: boolean;
  metadataOk: boolean;
  foundationOk: boolean;
} {
  const foundation = buildCommercialFoundation(input);
  const productConfigOk = foundation.productConfig.catalog.products.length === 3;
  const pricingConfigOk = foundation.pricingConfig.entries.length === 3;
  const featureMatrixOk = foundation.featureMatrix.features.length >= 7;
  const planRegistryOk = foundation.planRegistry.plans.length === 3;
  const capabilityMapOk =
    foundation.capabilityMap.tiers.length === 3 &&
    foundation.capabilityMap.tiers.every((t) => t.featureFlags.length > 0);
  const metadataOk = foundation.commercialMetadata.foundationReady;
  const foundationOk =
    productConfigOk &&
    pricingConfigOk &&
    featureMatrixOk &&
    planRegistryOk &&
    capabilityMapOk &&
    metadataOk;

  return {
    productConfigOk,
    pricingConfigOk,
    featureMatrixOk,
    planRegistryOk,
    capabilityMapOk,
    metadataOk,
    foundationOk,
  };
}

export { V64_COMMERCIAL_FOUNDATION_VERSION };
