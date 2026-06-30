/**
 * V64 P1 — Commercial metadata aggregator
 */
import {
  PRODUCT_PACKAGING_VERSION,
  validatePackaging,
} from "@/lib/productization/catalog";

import { buildCapabilityMap } from "./capability.map";
import { buildCommercialProductConfig } from "./product.config";
import type { CommercialMetadata } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialMetadata(input?: {
  deploymentId?: string;
}): CommercialMetadata {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  const product = buildCommercialProductConfig({ deploymentId });
  const capability = buildCapabilityMap({ deploymentId });
  const validation = validatePackaging({ deploymentId });
  const foundationReady =
    validation.packagingValid &&
    product.tiers.length === 3 &&
    capability.tiers.length === 3;

  return {
    version: V64_COMMERCIAL_FOUNDATION_VERSION,
    metadataId: `commercial-metadata-${deploymentId}`,
    productName: product.productName,
    foundationReady,
    catalogReady: validation.catalogExists && validation.plansExist,
    packagingValid: validation.packagingValid,
    tierCount: product.tiers.length,
    capabilityBindings: capability.tiers[0]?.capabilities.length ?? 0,
    backwardCompatible: {
      packagingVersion: PRODUCT_PACKAGING_VERSION,
      packagingValid: validation.packagingValid,
    },
    summary: [
      `commercial-metadata product=${product.productName}`,
      `foundationReady=${foundationReady}`,
      `packaging=${PRODUCT_PACKAGING_VERSION}`,
    ].join(" "),
  };
}
