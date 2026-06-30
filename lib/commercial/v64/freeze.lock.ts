/**
 * V64 P8 — Locked commercial layer version constants (read-only)
 */
import { PRODUCT_PACKAGING_VERSION } from "@/lib/productization/catalog";

import { V64_CAPABILITY_LAYER_VERSION } from "./capability.types";
import { V64_CATALOG_LAYER_VERSION } from "./catalog.types";
import { V64_FEATURE_MATRIX_LAYER_VERSION } from "./feature.types";
import { V64_PRICING_LAYER_VERSION } from "./pricing.types";
import { V64_TRANSITION_LAYER_VERSION } from "./transition.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";
import type { CommercialLayerVersionLock } from "./freeze.types";
import { V64_COMMERCIAL_FREEZE_VERSION } from "./freeze.types";
import { V64_VERIFY_LAYER_VERSION } from "./verify.types";

export const V64_COMMERCIAL_LAYER_VERSION_LOCK: CommercialLayerVersionLock = {
  foundation: V64_COMMERCIAL_FOUNDATION_VERSION,
  pricing: V64_PRICING_LAYER_VERSION,
  featureMatrix: V64_FEATURE_MATRIX_LAYER_VERSION,
  capability: V64_CAPABILITY_LAYER_VERSION,
  catalog: V64_CATALOG_LAYER_VERSION,
  transition: V64_TRANSITION_LAYER_VERSION,
  verify: V64_VERIFY_LAYER_VERSION,
  freeze: V64_COMMERCIAL_FREEZE_VERSION,
  packaging: PRODUCT_PACKAGING_VERSION,
};

export function isCommercialLayerVersionLockIntact(): boolean {
  const lock = V64_COMMERCIAL_LAYER_VERSION_LOCK;
  return Object.values(lock).every((value) => typeof value === "string" && value.length > 0);
}
