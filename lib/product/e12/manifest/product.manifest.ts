/**
 * E12-P1 — Product Manifest
 * Builds foundation manifest integrated with Platform v1 baseline
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PLATFORM_V1_FREEZE_VERSION } from "../../../platform/v1/platform.v1.constants";
import { isProductFeatureCatalogComplete } from "../catalog/product.feature.catalog";
import {
  E12_PRODUCT_BASE,
  E12_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
} from "../core/product.constants";
import { listProductEditions } from "../edition/product.edition";
import { listProductFeatures } from "../catalog/product.feature.catalog";
import { listProductIdentities } from "../identity/product.identity";
import { listCapabilityPackages } from "../packaging/product.capability.package";
import type { ProductFoundationManifest } from "../types/product.types";

export function buildProductFoundation(): ProductFoundationManifest {
  const platform = buildPlatformV1Manifest();
  const identities = listProductIdentities();
  const editions = listProductEditions();
  const features = listProductFeatures();
  const packages = listCapabilityPackages();

  const platformAligned = platform.aligned;
  const catalogComplete = isProductFeatureCatalogComplete();
  const hasActiveProduct = identities.some((i) => i.status === "ACTIVE");
  const baselineMatch = identities.every(
    (i) =>
      i.platformBaseline === E12_PRODUCT_BASE ||
      i.platformBaseline === platform.base,
  );

  const ready =
    platformAligned &&
    catalogComplete &&
    identities.length >= 1 &&
    features.length >= 1 &&
    baselineMatch &&
    (hasActiveProduct || identities.length > 0);

  return {
    productId: E12_PRODUCT_ID,
    version: E12_PRODUCT_VERSION,
    freezeVersion: E12_PRODUCT_FREEZE_VERSION,
    base: E12_PRODUCT_BASE,
    platformBaseline: `enterprise-platform-v1-complete@${PLATFORM_V1_FREEZE_VERSION}`,
    platformAligned,
    identities,
    editions,
    features,
    packages,
    ready,
    summary: [
      `e12-product-foundation ready=${ready}`,
      `product=${E12_PRODUCT_ID}`,
      `base=${E12_PRODUCT_BASE}`,
      `platformAligned=${platformAligned}`,
      `identities=${identities.length}`,
      `features=${features.length}`,
      `editions=${editions.length}`,
      `packages=${packages.length}`,
    ].join(" "),
  };
}

export function assertProductFoundationReady(
  manifest: ProductFoundationManifest = buildProductFoundation(),
): asserts manifest is ProductFoundationManifest & { ready: true } {
  if (!manifest.ready) {
    throw new Error(`E12 product foundation not ready: ${manifest.summary}`);
  }
}
