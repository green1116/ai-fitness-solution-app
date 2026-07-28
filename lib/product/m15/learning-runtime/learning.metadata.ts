/**
 * Product M15 — Evolution Learning Engine metadata + learning validator
 */

import {
  EVOLUTION_LEARNING_DOMAIN_SCOPES,
  EVOLUTION_LEARNING_KINDS,
  EVOLUTION_LEARNING_STATUSES,
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "./learning.constants";
import type {
  EvolutionLearning,
  EvolutionLearningValidationResult,
  RegisterEvolutionLearningInput,
} from "./learning.types";

export type EvolutionLearningMetadataRecord = {
  learningId: typeof PRODUCT_EVOLUTION_LEARNING_ID;
  version: typeof PRODUCT_EVOLUTION_LEARNING_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_LEARNING_BASE;
  module: "M15-P4";
  domain: "Enterprise Evolution";
  layer: "learning";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_LEARNING_METADATA: EvolutionLearningMetadataRecord =
  {
    learningId: PRODUCT_EVOLUTION_LEARNING_ID,
    version: PRODUCT_EVOLUTION_LEARNING_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_LEARNING_BASE,
    module: "M15-P4",
    domain: "Enterprise Evolution",
    layer: "learning",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "optimization-runtime",
      "recommendation-runtime",
      "execution-runtime",
    ],
  };

export function getEvolutionLearningMetadata(): EvolutionLearningMetadataRecord {
  return {
    ...PRODUCT_EVOLUTION_LEARNING_METADATA,
    excludes: [...PRODUCT_EVOLUTION_LEARNING_METADATA.excludes],
  };
}

export function isEvolutionLearningMetadataIntact(
  metadata: EvolutionLearningMetadataRecord = PRODUCT_EVOLUTION_LEARNING_METADATA,
): boolean {
  return (
    metadata.learningId === "enterprise-product-evolution-learning-v1" &&
    metadata.version === "product-evolution-learning-1" &&
    metadata.freezeVersion === "product-evolution-learning-freeze-1" &&
    metadata.base === "enterprise-product-evolution-experience-v1" &&
    metadata.module === "M15-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionLearningInput(
  input: RegisterEvolutionLearningInput,
): EvolutionLearningValidationResult {
  const issues: EvolutionLearningValidationResult["issues"] = [];
  const learningKey = input.learningKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!learningKey) {
    issues.push({ field: "learningKey", message: "required" });
  }
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(EVOLUTION_LEARNING_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(EVOLUTION_LEARNING_DOMAIN_SCOPES as readonly string[]).includes(
      input.scope,
    )
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionLearning(
  learning: EvolutionLearning,
): EvolutionLearningValidationResult {
  const issues: EvolutionLearningValidationResult["issues"] = [];
  if (!learning.id.trim()) issues.push({ field: "id", message: "required" });
  if (!learning.learningKey.trim()) {
    issues.push({ field: "learningKey", message: "required" });
  }
  if (
    !(EVOLUTION_LEARNING_KINDS as readonly string[]).includes(learning.kind)
  ) {
    issues.push({ field: "kind", message: `invalid kind: ${learning.kind}` });
  }
  if (
    !(EVOLUTION_LEARNING_STATUSES as readonly string[]).includes(
      learning.status,
    )
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${learning.status}`,
    });
  }
  if (
    !(EVOLUTION_LEARNING_DOMAIN_SCOPES as readonly string[]).includes(
      learning.scope,
    )
  ) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${learning.scope}`,
    });
  }
  if (!learning.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!learning.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!learning.experienceRef.trim()) {
    issues.push({ field: "experienceRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
