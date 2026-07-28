/**
 * Product M13 — OS Governance version metadata
 */

import {
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_TAG,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "./governance.constants";

export type OsGovernanceMetadataRecord = {
  governanceRuntimeId: typeof PRODUCT_OS_GOVERNANCE_ID;
  version: typeof PRODUCT_OS_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_OS_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_OS_GOVERNANCE_BASE;
  module: "M13-P6";
  domain: "Enterprise Operating System";
  layer: "governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_GOVERNANCE_METADATA: OsGovernanceMetadataRecord = {
  governanceRuntimeId: PRODUCT_OS_GOVERNANCE_ID,
  version: PRODUCT_OS_GOVERNANCE_VERSION,
  freezeVersion: PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  freezeTag: PRODUCT_OS_GOVERNANCE_FREEZE_TAG,
  base: PRODUCT_OS_GOVERNANCE_BASE,
  module: "M13-P6",
  domain: "Enterprise Operating System",
  layer: "governance",
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

export function getOsGovernanceMetadata(): OsGovernanceMetadataRecord {
  return {
    ...PRODUCT_OS_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_OS_GOVERNANCE_METADATA.excludes],
  };
}

export function isOsGovernanceMetadataIntact(
  metadata: OsGovernanceMetadataRecord = PRODUCT_OS_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceRuntimeId === "enterprise-product-os-governance-v1" &&
    metadata.version === "product-os-governance-1" &&
    metadata.freezeVersion === "product-os-governance-freeze-1" &&
    metadata.base === "enterprise-product-os-compatibility-v1" &&
    metadata.module === "M13-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
