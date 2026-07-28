/**
 * Product M14 — Intelligence governance binding registry
 */

import { INTELLIGENCE_GOVERNANCE_BINDING_STATUSES } from "./governance.constants";
import { getIntelligenceGovernanceReview } from "./review.registry";
import { getIntelligenceGovernanceStandard } from "./standard.registry";
import type {
  BindIntelligenceGovernanceReviewInput,
  IntelligenceGovernanceBinding,
  IntelligenceGovernanceBindingStatus,
} from "./governance.types";

const bindings = new Map<string, IntelligenceGovernanceBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: IntelligenceGovernanceBinding,
): IntelligenceGovernanceBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindIntelligenceGovernanceReview(
  input: BindIntelligenceGovernanceReviewInput,
): IntelligenceGovernanceBinding {
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

  const standard = getIntelligenceGovernanceStandard(standardId);
  if (!standard) throw new Error(`standard not found: ${standardId}`);
  if (standard.status !== "ACTIVE") {
    throw new Error(`standard not active: ${standardId}`);
  }

  const review = getIntelligenceGovernanceReview(reviewId);
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

  const id = input.id?.trim() || createId("intgovbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: IntelligenceGovernanceBinding = {
    id,
    standardId,
    reviewId,
    bindingKey,
    freezeGateRef,
    pairKeyRef,
    status: INTELLIGENCE_GOVERNANCE_BINDING_STATUSES[0],
    detail: `gate=${freezeGateRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getIntelligenceGovernanceBinding(
  id: string,
): IntelligenceGovernanceBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listIntelligenceGovernanceBindings(filter?: {
  standardId?: string;
  status?: IntelligenceGovernanceBindingStatus;
}): IntelligenceGovernanceBinding[] {
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

export function clearIntelligenceGovernanceBindings(): void {
  bindings.clear();
}
