/**
 * Product M15 — Evolution Experience Platform metadata + experience validator
 */

import {
  EVOLUTION_EXPERIENCE_DOMAIN_SCOPES,
  EVOLUTION_EXPERIENCE_KINDS,
  EVOLUTION_EXPERIENCE_STATUSES,
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "./experience.constants";
import type {
  EvolutionExperience,
  EvolutionExperienceValidationResult,
  RegisterEvolutionExperienceInput,
} from "./experience.types";

export type EvolutionExperienceMetadataRecord = {
  experienceId: typeof PRODUCT_EVOLUTION_EXPERIENCE_ID;
  version: typeof PRODUCT_EVOLUTION_EXPERIENCE_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_EXPERIENCE_BASE;
  module: "M15-P3";
  domain: "Enterprise Evolution";
  layer: "experience";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_EXPERIENCE_METADATA: EvolutionExperienceMetadataRecord =
  {
    experienceId: PRODUCT_EVOLUTION_EXPERIENCE_ID,
    version: PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_EXPERIENCE_BASE,
    module: "M15-P3",
    domain: "Enterprise Evolution",
    layer: "experience",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "learning-runtime",
      "optimization-runtime",
      "ai-analysis",
    ],
  };

export function getEvolutionExperienceMetadata(): EvolutionExperienceMetadataRecord {
  return {
    ...PRODUCT_EVOLUTION_EXPERIENCE_METADATA,
    excludes: [...PRODUCT_EVOLUTION_EXPERIENCE_METADATA.excludes],
  };
}

export function isEvolutionExperienceMetadataIntact(
  metadata: EvolutionExperienceMetadataRecord = PRODUCT_EVOLUTION_EXPERIENCE_METADATA,
): boolean {
  return (
    metadata.experienceId === "enterprise-product-evolution-experience-v1" &&
    metadata.version === "product-evolution-experience-1" &&
    metadata.freezeVersion === "product-evolution-experience-freeze-1" &&
    metadata.base === "enterprise-product-evolution-feedback-v1" &&
    metadata.module === "M15-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionExperienceInput(
  input: RegisterEvolutionExperienceInput,
): EvolutionExperienceValidationResult {
  const issues: EvolutionExperienceValidationResult["issues"] = [];
  const experienceKey = input.experienceKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!experienceKey) {
    issues.push({ field: "experienceKey", message: "required" });
  }
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(EVOLUTION_EXPERIENCE_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(EVOLUTION_EXPERIENCE_DOMAIN_SCOPES as readonly string[]).includes(
      input.scope,
    )
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionExperience(
  experience: EvolutionExperience,
): EvolutionExperienceValidationResult {
  const issues: EvolutionExperienceValidationResult["issues"] = [];
  if (!experience.id.trim()) issues.push({ field: "id", message: "required" });
  if (!experience.experienceKey.trim()) {
    issues.push({ field: "experienceKey", message: "required" });
  }
  if (
    !(EVOLUTION_EXPERIENCE_KINDS as readonly string[]).includes(experience.kind)
  ) {
    issues.push({
      field: "kind",
      message: `invalid kind: ${experience.kind}`,
    });
  }
  if (
    !(EVOLUTION_EXPERIENCE_STATUSES as readonly string[]).includes(
      experience.status,
    )
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${experience.status}`,
    });
  }
  if (
    !(EVOLUTION_EXPERIENCE_DOMAIN_SCOPES as readonly string[]).includes(
      experience.scope,
    )
  ) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${experience.scope}`,
    });
  }
  if (!experience.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!experience.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!experience.feedbackRef.trim()) {
    issues.push({ field: "feedbackRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
