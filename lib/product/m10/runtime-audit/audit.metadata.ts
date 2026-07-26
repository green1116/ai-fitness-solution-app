/**
 * Product M10 — AI Runtime Audit version metadata
 */

import {
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "./audit.constants";

export type AiRuntimeAuditMetadataRecord = {
  auditId: typeof PRODUCT_AI_RUNTIME_AUDIT_ID;
  version: typeof PRODUCT_AI_RUNTIME_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG;
  base: typeof PRODUCT_AI_RUNTIME_AUDIT_BASE;
  module: "M10-P7";
  domain: "Enterprise AI Runtime";
  layer: "runtime-audit";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_RUNTIME_AUDIT_METADATA: AiRuntimeAuditMetadataRecord =
  {
    auditId: PRODUCT_AI_RUNTIME_AUDIT_ID,
    version: PRODUCT_AI_RUNTIME_AUDIT_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
    freezeTag: PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG,
    base: PRODUCT_AI_RUNTIME_AUDIT_BASE,
    module: "M10-P7",
    domain: "Enterprise AI Runtime",
    layer: "runtime-audit",
    declarationOnly: true,
    excludes: [
      "allocation-runtime",
      "token-accounting",
      "autoscaling",
      "provider-runtime",
      "model-execution",
      "queue-execution",
      "scheduler-execution",
      "monitoring-implementation",
    ],
  };

export function getAiRuntimeAuditMetadata(): AiRuntimeAuditMetadataRecord {
  return {
    ...PRODUCT_AI_RUNTIME_AUDIT_METADATA,
    excludes: [...PRODUCT_AI_RUNTIME_AUDIT_METADATA.excludes],
  };
}

export function isAiRuntimeAuditMetadataIntact(
  metadata: AiRuntimeAuditMetadataRecord = PRODUCT_AI_RUNTIME_AUDIT_METADATA,
): boolean {
  return (
    metadata.auditId === "enterprise-product-ai-runtime-audit-v1" &&
    metadata.version === "product-ai-runtime-audit-1" &&
    metadata.freezeVersion === "product-ai-runtime-audit-freeze-1" &&
    metadata.base === "enterprise-product-ai-runtime-governance-v1" &&
    metadata.module === "M10-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}
