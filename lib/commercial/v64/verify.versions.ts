/**
 * V64 P7 — Version consistency checks across commercial layers
 */
import { PRODUCT_PACKAGING_VERSION } from "@/lib/productization/catalog";

import { V64_CAPABILITY_LAYER_VERSION } from "./capability.types";
import { V64_CATALOG_LAYER_VERSION } from "./catalog.types";
import { buildCommercialCapabilitySnapshot } from "./capability.snapshot";
import { buildTierCatalogSnapshot } from "./catalog.snapshot";
import { buildCommercialFeatureMatrixSnapshot } from "./feature.snapshot";
import { V64_FEATURE_MATRIX_LAYER_VERSION } from "./feature.types";
import { buildCommercialPricingSnapshot } from "./pricing.snapshot";
import { V64_PRICING_LAYER_VERSION } from "./pricing.types";
import { buildCommercialTransitionSnapshot } from "./transition.snapshot";
import { V64_TRANSITION_LAYER_VERSION } from "./transition.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";
import type { VersionConsistencyReport } from "./verify.types";
import { V64_VERIFY_LAYER_VERSION } from "./verify.types";

export const EXPECTED_LAYER_VERSIONS: Record<string, string> = {
  foundation: V64_COMMERCIAL_FOUNDATION_VERSION,
  pricing: V64_PRICING_LAYER_VERSION,
  featureMatrix: V64_FEATURE_MATRIX_LAYER_VERSION,
  capability: V64_CAPABILITY_LAYER_VERSION,
  catalog: V64_CATALOG_LAYER_VERSION,
  transition: V64_TRANSITION_LAYER_VERSION,
  verify: V64_VERIFY_LAYER_VERSION,
  packaging: PRODUCT_PACKAGING_VERSION,
};

export function checkVersionConsistency(input?: {
  deploymentId?: string;
}): VersionConsistencyReport {
  const deploymentId = input?.deploymentId ?? "v64-verify-layer-default";

  const pricing = buildCommercialPricingSnapshot({ deploymentId });
  const feature = buildCommercialFeatureMatrixSnapshot({ deploymentId });
  const capability = buildCommercialCapabilitySnapshot({ deploymentId });
  const catalog = buildTierCatalogSnapshot({ deploymentId });
  const transition = buildCommercialTransitionSnapshot({ deploymentId });

  const layerVersions = {
    ...EXPECTED_LAYER_VERSIONS,
    pricingSnapshot: pricing.version,
    featureSnapshot: feature.version,
    capabilitySnapshot: capability.version,
    catalogSnapshot: catalog.version,
    transitionSnapshot: transition.version,
  };

  const allSnapshotsReferenceFoundation =
    pricing.foundationVersion === V64_COMMERCIAL_FOUNDATION_VERSION &&
    feature.foundationVersion === V64_COMMERCIAL_FOUNDATION_VERSION &&
    capability.foundationVersion === V64_COMMERCIAL_FOUNDATION_VERSION &&
    catalog.foundationVersion === V64_COMMERCIAL_FOUNDATION_VERSION &&
    transition.foundationVersion === V64_COMMERCIAL_FOUNDATION_VERSION;

  const packagingVersionPresent = catalog.packagingVersion === PRODUCT_PACKAGING_VERSION;

  const versionConsistencyOk = allSnapshotsReferenceFoundation && packagingVersionPresent;

  return {
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
    layerVersions,
    allSnapshotsReferenceFoundation,
    packagingVersionPresent,
    versionConsistencyOk,
  };
}
