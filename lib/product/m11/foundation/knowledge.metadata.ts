/**
 * Product M11 — Knowledge Platform Foundation metadata + entity validator
 */

import {
  KNOWLEDGE_ACCESS_LEVELS,
  KNOWLEDGE_DOMAIN_SCOPES,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_ENTITY_STATUSES,
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
  PRODUCT_KNOWLEDGE_FREEZE_TAG,
} from "./knowledge.constants";
import type {
  KnowledgeEntity,
  KnowledgeEntityValidationResult,
  RegisterKnowledgeEntityInput,
} from "./knowledge.types";

export type KnowledgeFoundationMetadata = {
  foundationId: typeof PRODUCT_KNOWLEDGE_FOUNDATION_ID;
  version: typeof PRODUCT_KNOWLEDGE_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_FOUNDATION_BASE;
  module: "M11-P1";
  domain: "Knowledge Platform";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_FOUNDATION_METADATA: KnowledgeFoundationMetadata =
  {
    foundationId: PRODUCT_KNOWLEDGE_FOUNDATION_ID,
    version: PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
    freezeTag: PRODUCT_KNOWLEDGE_FREEZE_TAG,
    base: PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
    module: "M11-P1",
    domain: "Knowledge Platform",
    layer: "foundation",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "model-execution",
      "network",
      "business-logic",
    ],
  };

export function getKnowledgeFoundationMetadata(): KnowledgeFoundationMetadata {
  return {
    ...PRODUCT_KNOWLEDGE_FOUNDATION_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_FOUNDATION_METADATA.excludes],
  };
}

export function isKnowledgeFoundationMetadataIntact(
  metadata: KnowledgeFoundationMetadata = PRODUCT_KNOWLEDGE_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId ===
      "enterprise-product-knowledge-foundation-v1" &&
    metadata.version === "product-knowledge-1" &&
    metadata.freezeVersion === "product-knowledge-foundation-freeze-1" &&
    metadata.base === "enterprise-product-ai-runtime-baseline-v1" &&
    metadata.module === "M11-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

/** Validates register input against frozen domain constraints. */
export function validateKnowledgeEntityInput(
  input: RegisterKnowledgeEntityInput,
): KnowledgeEntityValidationResult {
  const issues: KnowledgeEntityValidationResult["issues"] = [];
  const entityKey = input.entityKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!entityKey) issues.push({ field: "entityKey", message: "required" });
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(KNOWLEDGE_ENTITY_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (!(KNOWLEDGE_DOMAIN_SCOPES as readonly string[]).includes(input.scope)) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }
  if (
    input.access !== undefined &&
    !(KNOWLEDGE_ACCESS_LEVELS as readonly string[]).includes(input.access)
  ) {
    issues.push({
      field: "access",
      message: `invalid access: ${input.access}`,
    });
  }
  if (input.tags) {
    for (const tag of input.tags) {
      if (!tag.trim()) {
        issues.push({ field: "tags", message: "empty tag not allowed" });
        break;
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

/** Validates a stored entity against frozen domain constraints. */
export function validateKnowledgeEntity(
  entity: KnowledgeEntity,
): KnowledgeEntityValidationResult {
  const issues: KnowledgeEntityValidationResult["issues"] = [];
  if (!entity.id.trim()) issues.push({ field: "id", message: "required" });
  if (!entity.entityKey.trim()) {
    issues.push({ field: "entityKey", message: "required" });
  }
  if (!(KNOWLEDGE_ENTITY_KINDS as readonly string[]).includes(entity.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${entity.kind}` });
  }
  if (
    !(KNOWLEDGE_ENTITY_STATUSES as readonly string[]).includes(entity.status)
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${entity.status}`,
    });
  }
  if (!(KNOWLEDGE_ACCESS_LEVELS as readonly string[]).includes(entity.access)) {
    issues.push({
      field: "access",
      message: `invalid access: ${entity.access}`,
    });
  }
  if (!(KNOWLEDGE_DOMAIN_SCOPES as readonly string[]).includes(entity.scope)) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${entity.scope}`,
    });
  }
  if (!entity.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!entity.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!entity.runtimeBaselineRef.trim()) {
    issues.push({ field: "runtimeBaselineRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
