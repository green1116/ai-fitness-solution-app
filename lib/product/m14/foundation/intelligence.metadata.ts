/**
 * Product M14 — Enterprise Intelligence Foundation metadata + lens validator
 */

import {
  INTELLIGENCE_DOMAIN_SCOPES,
  INTELLIGENCE_LENS_KINDS,
  INTELLIGENCE_LENS_STATUSES,
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
  PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_FOUNDATION_ID,
  PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
  PRODUCT_INTELLIGENCE_FREEZE_TAG,
} from "./intelligence.constants";
import type {
  IntelligenceLens,
  IntelligenceLensValidationResult,
  RegisterIntelligenceLensInput,
} from "./intelligence.types";

export type IntelligenceFoundationMetadata = {
  foundationId: typeof PRODUCT_INTELLIGENCE_FOUNDATION_ID;
  version: typeof PRODUCT_INTELLIGENCE_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_FOUNDATION_BASE;
  module: "M14-P1";
  domain: "Enterprise Intelligence";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_FOUNDATION_METADATA: IntelligenceFoundationMetadata =
  {
    foundationId: PRODUCT_INTELLIGENCE_FOUNDATION_ID,
    version: PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
    module: "M14-P1",
    domain: "Enterprise Intelligence",
    layer: "foundation",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "intelligence-execution",
      "workflow-runtime",
      "tool-runtime",
    ],
  };

export function getIntelligenceFoundationMetadata(): IntelligenceFoundationMetadata {
  return {
    ...PRODUCT_INTELLIGENCE_FOUNDATION_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_FOUNDATION_METADATA.excludes],
  };
}

export function isIntelligenceFoundationMetadataIntact(
  metadata: IntelligenceFoundationMetadata = PRODUCT_INTELLIGENCE_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId ===
      "enterprise-product-intelligence-foundation-v1" &&
    metadata.version === "product-intelligence-1" &&
    metadata.freezeVersion ===
      "product-intelligence-foundation-freeze-1" &&
    metadata.base === "enterprise-product-os-baseline-v1" &&
    metadata.module === "M14-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateIntelligenceLensInput(
  input: RegisterIntelligenceLensInput,
): IntelligenceLensValidationResult {
  const issues: IntelligenceLensValidationResult["issues"] = [];
  const lensKey = input.lensKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!lensKey) issues.push({ field: "lensKey", message: "required" });
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(INTELLIGENCE_LENS_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(INTELLIGENCE_DOMAIN_SCOPES as readonly string[]).includes(input.scope)
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateIntelligenceLens(
  lens: IntelligenceLens,
): IntelligenceLensValidationResult {
  const issues: IntelligenceLensValidationResult["issues"] = [];
  if (!lens.id.trim()) issues.push({ field: "id", message: "required" });
  if (!lens.lensKey.trim()) {
    issues.push({ field: "lensKey", message: "required" });
  }
  if (!(INTELLIGENCE_LENS_KINDS as readonly string[]).includes(lens.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${lens.kind}` });
  }
  if (
    !(INTELLIGENCE_LENS_STATUSES as readonly string[]).includes(lens.status)
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${lens.status}`,
    });
  }
  if (!(INTELLIGENCE_DOMAIN_SCOPES as readonly string[]).includes(lens.scope)) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${lens.scope}`,
    });
  }
  if (!lens.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!lens.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!lens.osBaselineRef.trim()) {
    issues.push({ field: "osBaselineRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
