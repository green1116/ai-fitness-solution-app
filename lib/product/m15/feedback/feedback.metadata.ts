/**
 * Product M15 — Evolution Feedback Platform metadata + feedback validator
 */

import {
  EVOLUTION_FEEDBACK_DOMAIN_SCOPES,
  EVOLUTION_FEEDBACK_KINDS,
  EVOLUTION_FEEDBACK_STATUSES,
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "./feedback.constants";
import type {
  EvolutionFeedback,
  EvolutionFeedbackValidationResult,
  RegisterEvolutionFeedbackInput,
} from "./feedback.types";

export type EvolutionFeedbackMetadataRecord = {
  feedbackId: typeof PRODUCT_EVOLUTION_FEEDBACK_ID;
  version: typeof PRODUCT_EVOLUTION_FEEDBACK_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_FEEDBACK_BASE;
  module: "M15-P2";
  domain: "Enterprise Evolution";
  layer: "feedback";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_FEEDBACK_METADATA: EvolutionFeedbackMetadataRecord =
  {
    feedbackId: PRODUCT_EVOLUTION_FEEDBACK_ID,
    version: PRODUCT_EVOLUTION_FEEDBACK_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_FEEDBACK_BASE,
    module: "M15-P2",
    domain: "Enterprise Evolution",
    layer: "feedback",
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

export function getEvolutionFeedbackMetadata(): EvolutionFeedbackMetadataRecord {
  return {
    ...PRODUCT_EVOLUTION_FEEDBACK_METADATA,
    excludes: [...PRODUCT_EVOLUTION_FEEDBACK_METADATA.excludes],
  };
}

export function isEvolutionFeedbackMetadataIntact(
  metadata: EvolutionFeedbackMetadataRecord = PRODUCT_EVOLUTION_FEEDBACK_METADATA,
): boolean {
  return (
    metadata.feedbackId === "enterprise-product-evolution-feedback-v1" &&
    metadata.version === "product-evolution-feedback-1" &&
    metadata.freezeVersion === "product-evolution-feedback-freeze-1" &&
    metadata.base === "enterprise-product-evolution-foundation-v1" &&
    metadata.module === "M15-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionFeedbackInput(
  input: RegisterEvolutionFeedbackInput,
): EvolutionFeedbackValidationResult {
  const issues: EvolutionFeedbackValidationResult["issues"] = [];
  const feedbackKey = input.feedbackKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!feedbackKey) {
    issues.push({ field: "feedbackKey", message: "required" });
  }
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(EVOLUTION_FEEDBACK_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(EVOLUTION_FEEDBACK_DOMAIN_SCOPES as readonly string[]).includes(
      input.scope,
    )
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionFeedback(
  feedback: EvolutionFeedback,
): EvolutionFeedbackValidationResult {
  const issues: EvolutionFeedbackValidationResult["issues"] = [];
  if (!feedback.id.trim()) issues.push({ field: "id", message: "required" });
  if (!feedback.feedbackKey.trim()) {
    issues.push({ field: "feedbackKey", message: "required" });
  }
  if (
    !(EVOLUTION_FEEDBACK_KINDS as readonly string[]).includes(feedback.kind)
  ) {
    issues.push({ field: "kind", message: `invalid kind: ${feedback.kind}` });
  }
  if (
    !(EVOLUTION_FEEDBACK_STATUSES as readonly string[]).includes(
      feedback.status,
    )
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${feedback.status}`,
    });
  }
  if (
    !(EVOLUTION_FEEDBACK_DOMAIN_SCOPES as readonly string[]).includes(
      feedback.scope,
    )
  ) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${feedback.scope}`,
    });
  }
  if (!feedback.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!feedback.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!feedback.foundationRef.trim()) {
    issues.push({ field: "foundationRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
