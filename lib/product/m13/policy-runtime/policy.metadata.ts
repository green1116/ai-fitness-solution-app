/**
 * Product M13 — OS Policy Runtime version metadata
 */

import {
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_TAG,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "./policy.constants";

export type OsPolicyMetadataRecord = {
  policyRuntimeId: typeof PRODUCT_OS_POLICY_ID;
  version: typeof PRODUCT_OS_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_OS_POLICY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_POLICY_FREEZE_TAG;
  base: typeof PRODUCT_OS_POLICY_BASE;
  module: "M13-P4";
  domain: "Enterprise Operating System";
  layer: "policy-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_POLICY_METADATA: OsPolicyMetadataRecord = {
  policyRuntimeId: PRODUCT_OS_POLICY_ID,
  version: PRODUCT_OS_POLICY_VERSION,
  freezeVersion: PRODUCT_OS_POLICY_FREEZE_VERSION,
  freezeTag: PRODUCT_OS_POLICY_FREEZE_TAG,
  base: PRODUCT_OS_POLICY_BASE,
  module: "M13-P4",
  domain: "Enterprise Operating System",
  layer: "policy-runtime",
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

export function getOsPolicyMetadata(): OsPolicyMetadataRecord {
  return {
    ...PRODUCT_OS_POLICY_METADATA,
    excludes: [...PRODUCT_OS_POLICY_METADATA.excludes],
  };
}

export function isOsPolicyMetadataIntact(
  metadata: OsPolicyMetadataRecord = PRODUCT_OS_POLICY_METADATA,
): boolean {
  return (
    metadata.policyRuntimeId === "enterprise-product-os-policy-v1" &&
    metadata.version === "product-os-policy-1" &&
    metadata.freezeVersion === "product-os-policy-freeze-1" &&
    metadata.base === "enterprise-product-os-dependency-v1" &&
    metadata.module === "M13-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
