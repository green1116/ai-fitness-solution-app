/**
 * Product M13 — OS Lifecycle Runtime version metadata
 */

import {
  PRODUCT_OS_LIFECYCLE_BASE,
  PRODUCT_OS_LIFECYCLE_FREEZE_TAG,
  PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_OS_LIFECYCLE_ID,
  PRODUCT_OS_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type OsLifecycleMetadataRecord = {
  lifecycleRuntimeId: typeof PRODUCT_OS_LIFECYCLE_ID;
  version: typeof PRODUCT_OS_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_OS_LIFECYCLE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_LIFECYCLE_FREEZE_TAG;
  base: typeof PRODUCT_OS_LIFECYCLE_BASE;
  module: "M13-P7";
  domain: "Enterprise Operating System";
  layer: "lifecycle-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_LIFECYCLE_METADATA: OsLifecycleMetadataRecord = {
  lifecycleRuntimeId: PRODUCT_OS_LIFECYCLE_ID,
  version: PRODUCT_OS_LIFECYCLE_VERSION,
  freezeVersion: PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  freezeTag: PRODUCT_OS_LIFECYCLE_FREEZE_TAG,
  base: PRODUCT_OS_LIFECYCLE_BASE,
  module: "M13-P7",
  domain: "Enterprise Operating System",
  layer: "lifecycle-runtime",
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

export function getOsLifecycleMetadata(): OsLifecycleMetadataRecord {
  return {
    ...PRODUCT_OS_LIFECYCLE_METADATA,
    excludes: [...PRODUCT_OS_LIFECYCLE_METADATA.excludes],
  };
}

export function isOsLifecycleMetadataIntact(
  metadata: OsLifecycleMetadataRecord = PRODUCT_OS_LIFECYCLE_METADATA,
): boolean {
  return (
    metadata.lifecycleRuntimeId === "enterprise-product-os-lifecycle-v1" &&
    metadata.version === "product-os-lifecycle-1" &&
    metadata.freezeVersion === "product-os-lifecycle-freeze-1" &&
    metadata.base === "enterprise-product-os-governance-v1" &&
    metadata.module === "M13-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
