/**
 * Product M13 — OS Compatibility Runtime version metadata
 */

import {
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type OsCompatibilityMetadataRecord = {
  compatibilityRuntimeId: typeof PRODUCT_OS_COMPATIBILITY_ID;
  version: typeof PRODUCT_OS_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_COMPATIBILITY_FREEZE_TAG;
  base: typeof PRODUCT_OS_COMPATIBILITY_BASE;
  module: "M13-P5";
  domain: "Enterprise Operating System";
  layer: "compatibility-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_COMPATIBILITY_METADATA: OsCompatibilityMetadataRecord =
  {
    compatibilityRuntimeId: PRODUCT_OS_COMPATIBILITY_ID,
    version: PRODUCT_OS_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
    freezeTag: PRODUCT_OS_COMPATIBILITY_FREEZE_TAG,
    base: PRODUCT_OS_COMPATIBILITY_BASE,
    module: "M13-P5",
    domain: "Enterprise Operating System",
    layer: "compatibility-runtime",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "os-execution",
      "tool-runtime",
    ],
  };

export function getOsCompatibilityMetadata(): OsCompatibilityMetadataRecord {
  return {
    ...PRODUCT_OS_COMPATIBILITY_METADATA,
    excludes: [...PRODUCT_OS_COMPATIBILITY_METADATA.excludes],
  };
}

export function isOsCompatibilityMetadataIntact(
  metadata: OsCompatibilityMetadataRecord = PRODUCT_OS_COMPATIBILITY_METADATA,
): boolean {
  return (
    metadata.compatibilityRuntimeId ===
      "enterprise-product-os-compatibility-v1" &&
    metadata.version === "product-os-compatibility-1" &&
    metadata.freezeVersion === "product-os-compatibility-freeze-1" &&
    metadata.base === "enterprise-product-os-policy-v1" &&
    metadata.module === "M13-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
