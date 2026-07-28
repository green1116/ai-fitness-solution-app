/**
 * Product M13 — OS Dependency Runtime version metadata
 */

import {
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_TAG,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type OsDependencyMetadataRecord = {
  dependencyRuntimeId: typeof PRODUCT_OS_DEPENDENCY_ID;
  version: typeof PRODUCT_OS_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_OS_DEPENDENCY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_DEPENDENCY_FREEZE_TAG;
  base: typeof PRODUCT_OS_DEPENDENCY_BASE;
  module: "M13-P3";
  domain: "Enterprise Operating System";
  layer: "dependency-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_DEPENDENCY_METADATA: OsDependencyMetadataRecord = {
  dependencyRuntimeId: PRODUCT_OS_DEPENDENCY_ID,
  version: PRODUCT_OS_DEPENDENCY_VERSION,
  freezeVersion: PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  freezeTag: PRODUCT_OS_DEPENDENCY_FREEZE_TAG,
  base: PRODUCT_OS_DEPENDENCY_BASE,
  module: "M13-P3",
  domain: "Enterprise Operating System",
  layer: "dependency-runtime",
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

export function getOsDependencyMetadata(): OsDependencyMetadataRecord {
  return {
    ...PRODUCT_OS_DEPENDENCY_METADATA,
    excludes: [...PRODUCT_OS_DEPENDENCY_METADATA.excludes],
  };
}

export function isOsDependencyMetadataIntact(
  metadata: OsDependencyMetadataRecord = PRODUCT_OS_DEPENDENCY_METADATA,
): boolean {
  return (
    metadata.dependencyRuntimeId === "enterprise-product-os-dependency-v1" &&
    metadata.version === "product-os-dependency-1" &&
    metadata.freezeVersion === "product-os-dependency-freeze-1" &&
    metadata.base === "enterprise-product-os-catalog-v1" &&
    metadata.module === "M13-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
