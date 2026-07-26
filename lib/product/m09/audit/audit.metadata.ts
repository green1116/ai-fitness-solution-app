/**
 * Product M09 — AI Audit version metadata
 */

import {
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_TAG,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "./audit.constants";

export type AiAuditMetadataRecord = {
  auditId: typeof PRODUCT_AI_AUDIT_ID;
  version: typeof PRODUCT_AI_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_AI_AUDIT_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_AUDIT_FREEZE_TAG;
  base: typeof PRODUCT_AI_AUDIT_BASE;
  module: "M09-P7";
  domain: "AI Enhancement";
  layer: "audit";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_AUDIT_METADATA: AiAuditMetadataRecord = {
  auditId: PRODUCT_AI_AUDIT_ID,
  version: PRODUCT_AI_AUDIT_VERSION,
  freezeVersion: PRODUCT_AI_AUDIT_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_AUDIT_FREEZE_TAG,
  base: PRODUCT_AI_AUDIT_BASE,
  module: "M09-P7",
  domain: "AI Enhancement",
  layer: "audit",
  declarationOnly: true,
  excludes: [
    "provider-runtime",
    "model-execution",
    "workflow-runtime",
    "orchestration-runtime",
    "agent-runtime",
    "tool-runtime",
    "monitoring-implementation",
  ],
};

export function getAiAuditMetadata(): AiAuditMetadataRecord {
  return {
    ...PRODUCT_AI_AUDIT_METADATA,
    excludes: [...PRODUCT_AI_AUDIT_METADATA.excludes],
  };
}

export function isAiAuditMetadataIntact(
  metadata: AiAuditMetadataRecord = PRODUCT_AI_AUDIT_METADATA,
): boolean {
  return (
    metadata.auditId === "enterprise-product-ai-audit-v1" &&
    metadata.version === "product-ai-audit-1" &&
    metadata.freezeVersion === "product-ai-audit-freeze-1" &&
    metadata.base === "enterprise-product-ai-governance-v1" &&
    metadata.module === "M09-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
