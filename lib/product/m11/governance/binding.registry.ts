/**
 * Product M11 — Knowledge governance binding registry
 */

import { KNOWLEDGE_GOVERNANCE_BINDING_STATUSES } from "./governance.constants";
import { getKnowledgeGovernanceReview } from "./review.registry";
import { getKnowledgeGovernanceStandard } from "./standard.registry";
import type {
  BindKnowledgeGovernanceReviewInput,
  KnowledgeGovernanceBinding,
  KnowledgeGovernanceBindingStatus,
} from "./governance.types";

const bindings = new Map<string, KnowledgeGovernanceBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: KnowledgeGovernanceBinding,
): KnowledgeGovernanceBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindKnowledgeGovernanceReview(
  input: BindKnowledgeGovernanceReviewInput,
): KnowledgeGovernanceBinding {
  const standardId = input.standardId.trim();
  const reviewId = input.reviewId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const freezeGateRef = input.freezeGateRef.trim().toUpperCase();
  const pairKeyRef = input.pairKeyRef.trim().toUpperCase();
  if (!standardId) throw new Error("binding.standardId is required");
  if (!reviewId) throw new Error("binding.reviewId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!freezeGateRef) throw new Error("binding.freezeGateRef is required");
  if (!pairKeyRef) throw new Error("binding.pairKeyRef is required");

  const standard = getKnowledgeGovernanceStandard(standardId);
  if (!standard) throw new Error(`standard not found: ${standardId}`);
  if (standard.status !== "ACTIVE") {
    throw new Error(`standard not active: ${standardId}`);
  }

  const review = getKnowledgeGovernanceReview(reviewId);
  if (!review) throw new Error(`review not found: ${reviewId}`);
  if (review.standardId !== standardId) {
    throw new Error(`review standard mismatch: ${reviewId}`);
  }
  if (review.status !== "DECLARED") {
    throw new Error(`review not declared: ${reviewId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.standardId === standardId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("knwgovbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: KnowledgeGovernanceBinding = {
    id,
    standardId,
    reviewId,
    bindingKey,
    freezeGateRef,
    pairKeyRef,
    status: KNOWLEDGE_GOVERNANCE_BINDING_STATUSES[0],
    detail: `gate=${freezeGateRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getKnowledgeGovernanceBinding(
  id: string,
): KnowledgeGovernanceBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listKnowledgeGovernanceBindings(filter?: {
  standardId?: string;
  status?: KnowledgeGovernanceBindingStatus;
}): KnowledgeGovernanceBinding[] {
  let result = [...bindings.values()];
  if (filter?.standardId) {
    const standardId = filter.standardId.trim();
    result = result.filter((b) => b.standardId === standardId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearKnowledgeGovernanceBindings(): void {
  bindings.clear();
}
