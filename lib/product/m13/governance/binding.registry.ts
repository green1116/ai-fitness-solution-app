/**
 * Product M13 — OS governance binding registry
 */

import { OS_GOVERNANCE_BINDING_STATUSES } from "./governance.constants";
import { getOsGovernanceReview } from "./review.registry";
import { getOsGovernanceStandard } from "./standard.registry";
import type {
  BindOsGovernanceReviewInput,
  OsGovernanceBinding,
  OsGovernanceBindingStatus,
} from "./governance.types";

const bindings = new Map<string, OsGovernanceBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: OsGovernanceBinding): OsGovernanceBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindOsGovernanceReview(
  input: BindOsGovernanceReviewInput,
): OsGovernanceBinding {
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

  const standard = getOsGovernanceStandard(standardId);
  if (!standard) throw new Error(`standard not found: ${standardId}`);
  if (standard.status !== "ACTIVE") {
    throw new Error(`standard not active: ${standardId}`);
  }

  const review = getOsGovernanceReview(reviewId);
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

  const id = input.id?.trim() || createId("osgovbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: OsGovernanceBinding = {
    id,
    standardId,
    reviewId,
    bindingKey,
    freezeGateRef,
    pairKeyRef,
    status: OS_GOVERNANCE_BINDING_STATUSES[0],
    detail: `gate=${freezeGateRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getOsGovernanceBinding(
  id: string,
): OsGovernanceBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listOsGovernanceBindings(filter?: {
  standardId?: string;
  status?: OsGovernanceBindingStatus;
}): OsGovernanceBinding[] {
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

export function clearOsGovernanceBindings(): void {
  bindings.clear();
}
