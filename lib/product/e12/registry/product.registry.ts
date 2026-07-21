/**
 * E12-P1 — Product Registry
 * Registry manifest over identities / editions / features / packages
 */

import { listProductFeatures, clearProductFeatures } from "../catalog/product.feature.catalog";
import {
  E12_PRODUCT_BASE,
  E12_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
} from "../core/product.constants";
import { listProductEditions, clearProductEditions } from "../edition/product.edition";
import {
  listProductIdentities,
  clearProductIdentities,
} from "../identity/product.identity";
import {
  listCapabilityPackages,
  clearCapabilityPackages,
} from "../packaging/product.capability.package";
import type { ProductRegistryManifest } from "../types/product.types";

export function getProductRegistryManifest(): ProductRegistryManifest {
  return {
    productId: E12_PRODUCT_ID,
    version: E12_PRODUCT_VERSION,
    freezeVersion: E12_PRODUCT_FREEZE_VERSION,
    base: E12_PRODUCT_BASE,
    identityCount: listProductIdentities().length,
    editionCount: listProductEditions().length,
    featureCount: listProductFeatures().length,
    packageCount: listCapabilityPackages().length,
  };
}

export function clearProductRegistry(): void {
  clearCapabilityPackages();
  clearProductEditions();
  clearProductFeatures();
  clearProductIdentities();
}
