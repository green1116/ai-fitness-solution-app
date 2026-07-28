/**
 * Product M13 — Enterprise Operating System Foundation metadata + surface validator
 */

import {
  OS_DOMAIN_SCOPES,
  OS_SURFACE_KINDS,
  OS_SURFACE_STATUSES,
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
  PRODUCT_OS_FREEZE_TAG,
} from "./os.constants";
import type {
  OsSurface,
  OsSurfaceValidationResult,
  RegisterOsSurfaceInput,
} from "./os.types";

export type OsFoundationMetadata = {
  foundationId: typeof PRODUCT_OS_FOUNDATION_ID;
  version: typeof PRODUCT_OS_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_OS_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_FREEZE_TAG;
  base: typeof PRODUCT_OS_FOUNDATION_BASE;
  module: "M13-P1";
  domain: "Enterprise Operating System";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_FOUNDATION_METADATA: OsFoundationMetadata = {
  foundationId: PRODUCT_OS_FOUNDATION_ID,
  version: PRODUCT_OS_FOUNDATION_VERSION,
  freezeVersion: PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  freezeTag: PRODUCT_OS_FREEZE_TAG,
  base: PRODUCT_OS_FOUNDATION_BASE,
  module: "M13-P1",
  domain: "Enterprise Operating System",
  layer: "foundation",
  declarationOnly: true,
  excludes: [
    "database",
    "vector-store",
    "rag-runtime",
    "embedding",
    "external-provider",
    "os-execution",
    "workflow-runtime",
    "tool-runtime",
  ],
};

export function getOsFoundationMetadata(): OsFoundationMetadata {
  return {
    ...PRODUCT_OS_FOUNDATION_METADATA,
    excludes: [...PRODUCT_OS_FOUNDATION_METADATA.excludes],
  };
}

export function isOsFoundationMetadataIntact(
  metadata: OsFoundationMetadata = PRODUCT_OS_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId === "enterprise-product-os-foundation-v1" &&
    metadata.version === "product-os-1" &&
    metadata.freezeVersion === "product-os-foundation-freeze-1" &&
    metadata.base === "enterprise-product-agent-baseline-v1" &&
    metadata.module === "M13-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateOsSurfaceInput(
  input: RegisterOsSurfaceInput,
): OsSurfaceValidationResult {
  const issues: OsSurfaceValidationResult["issues"] = [];
  const surfaceKey = input.surfaceKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!surfaceKey) issues.push({ field: "surfaceKey", message: "required" });
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(OS_SURFACE_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (!(OS_DOMAIN_SCOPES as readonly string[]).includes(input.scope)) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateOsSurface(
  surface: OsSurface,
): OsSurfaceValidationResult {
  const issues: OsSurfaceValidationResult["issues"] = [];
  if (!surface.id.trim()) issues.push({ field: "id", message: "required" });
  if (!surface.surfaceKey.trim()) {
    issues.push({ field: "surfaceKey", message: "required" });
  }
  if (!(OS_SURFACE_KINDS as readonly string[]).includes(surface.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${surface.kind}` });
  }
  if (!(OS_SURFACE_STATUSES as readonly string[]).includes(surface.status)) {
    issues.push({
      field: "status",
      message: `invalid status: ${surface.status}`,
    });
  }
  if (!(OS_DOMAIN_SCOPES as readonly string[]).includes(surface.scope)) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${surface.scope}`,
    });
  }
  if (!surface.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!surface.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!surface.agentBaselineRef.trim()) {
    issues.push({ field: "agentBaselineRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
