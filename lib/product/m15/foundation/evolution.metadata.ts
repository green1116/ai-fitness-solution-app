/**
 * Product M15 — Enterprise Evolution Foundation metadata + track validator
 */

import {
  EVOLUTION_DOMAIN_SCOPES,
  EVOLUTION_TRACK_KINDS,
  EVOLUTION_TRACK_STATUSES,
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
  PRODUCT_EVOLUTION_FREEZE_TAG,
} from "./evolution.constants";
import type {
  EvolutionTrack,
  EvolutionTrackValidationResult,
  RegisterEvolutionTrackInput,
} from "./evolution.types";

export type EvolutionFoundationMetadata = {
  foundationId: typeof PRODUCT_EVOLUTION_FOUNDATION_ID;
  version: typeof PRODUCT_EVOLUTION_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_FOUNDATION_BASE;
  module: "M15-P1";
  domain: "Enterprise Evolution";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_FOUNDATION_METADATA: EvolutionFoundationMetadata =
  {
    foundationId: PRODUCT_EVOLUTION_FOUNDATION_ID,
    version: PRODUCT_EVOLUTION_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_FOUNDATION_BASE,
    module: "M15-P1",
    domain: "Enterprise Evolution",
    layer: "foundation",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "evolution-execution",
      "workflow-runtime",
      "tool-runtime",
    ],
  };

export function getEvolutionFoundationMetadata(): EvolutionFoundationMetadata {
  return {
    ...PRODUCT_EVOLUTION_FOUNDATION_METADATA,
    excludes: [...PRODUCT_EVOLUTION_FOUNDATION_METADATA.excludes],
  };
}

export function isEvolutionFoundationMetadataIntact(
  metadata: EvolutionFoundationMetadata = PRODUCT_EVOLUTION_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId === "enterprise-product-evolution-foundation-v1" &&
    metadata.version === "product-evolution-1" &&
    metadata.freezeVersion === "product-evolution-foundation-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-baseline-v1" &&
    metadata.module === "M15-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionTrackInput(
  input: RegisterEvolutionTrackInput,
): EvolutionTrackValidationResult {
  const issues: EvolutionTrackValidationResult["issues"] = [];
  const trackKey = input.trackKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!trackKey) issues.push({ field: "trackKey", message: "required" });
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(EVOLUTION_TRACK_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (!(EVOLUTION_DOMAIN_SCOPES as readonly string[]).includes(input.scope)) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionTrack(
  track: EvolutionTrack,
): EvolutionTrackValidationResult {
  const issues: EvolutionTrackValidationResult["issues"] = [];
  if (!track.id.trim()) issues.push({ field: "id", message: "required" });
  if (!track.trackKey.trim()) {
    issues.push({ field: "trackKey", message: "required" });
  }
  if (!(EVOLUTION_TRACK_KINDS as readonly string[]).includes(track.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${track.kind}` });
  }
  if (
    !(EVOLUTION_TRACK_STATUSES as readonly string[]).includes(track.status)
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${track.status}`,
    });
  }
  if (!(EVOLUTION_DOMAIN_SCOPES as readonly string[]).includes(track.scope)) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${track.scope}`,
    });
  }
  if (!track.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!track.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!track.intelligenceBaselineRef.trim()) {
    issues.push({ field: "intelligenceBaselineRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
