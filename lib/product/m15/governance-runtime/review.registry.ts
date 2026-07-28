/**
 * Product M15 — Evolution governance review in-memory registry
 */

import {
  EVOLUTION_GOVERNANCE_REVIEW_KINDS,
  EVOLUTION_GOVERNANCE_REVIEW_STATUSES,
} from "./governance.constants";
import { getEvolutionGovernance } from "./governance.registry";
import type {
  EvolutionGovernanceReview,
  EvolutionGovernanceReviewKind,
  EvolutionGovernanceReviewStatus,
  RegisterEvolutionGovernanceReviewInput,
  UpdateEvolutionGovernanceReviewStatusInput,
} from "./governance.types";

const reviews = new Map<string, EvolutionGovernanceReview>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReview(
  review: EvolutionGovernanceReview,
): EvolutionGovernanceReview {
  return { ...review, metadata: { ...review.metadata } };
}

export function registerEvolutionGovernanceReview(
  input: RegisterEvolutionGovernanceReviewInput,
): EvolutionGovernanceReview {
  const governanceId = input.governanceId.trim();
  const reviewKey = input.reviewKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!governanceId) throw new Error("review.governanceId is required");
  if (!reviewKey) throw new Error("review.reviewKey is required");
  if (!summary) throw new Error("review.summary is required");
  if (
    !(EVOLUTION_GOVERNANCE_REVIEW_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid review kind: ${input.kind}`);
  }
  if (keys.has(reviewKey)) {
    throw new Error(`reviewKey already exists: ${reviewKey}`);
  }

  const governance = getEvolutionGovernance(governanceId);
  if (!governance) throw new Error(`governance not found: ${governanceId}`);
  if (governance.status !== "ACTIVE" && governance.status !== "DRAFT") {
    throw new Error(`governance not reviewable: ${governance.governanceKey}`);
  }

  const id = input.id?.trim() || createId("evogovrev");
  if (reviews.has(id)) throw new Error(`review already exists: ${id}`);

  const now = nowIso();
  const review: EvolutionGovernanceReview = {
    id,
    governanceId,
    reviewKey,
    kind: input.kind,
    status: EVOLUTION_GOVERNANCE_REVIEW_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  reviews.set(id, review);
  keys.set(reviewKey, id);
  return cloneReview(review);
}

export function updateEvolutionGovernanceReviewStatus(
  input: UpdateEvolutionGovernanceReviewStatusInput,
): EvolutionGovernanceReview {
  const reviewId = input.reviewId.trim();
  if (!reviewId) throw new Error("review.reviewId is required");
  if (
    !(EVOLUTION_GOVERNANCE_REVIEW_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid review status: ${input.status}`);
  }

  const existing = reviews.get(reviewId);
  if (!existing) throw new Error(`review not found: ${reviewId}`);

  const updated: EvolutionGovernanceReview = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  reviews.set(reviewId, updated);
  return cloneReview(updated);
}

export function getEvolutionGovernanceReview(
  id: string,
): EvolutionGovernanceReview | undefined {
  const review = reviews.get(id.trim());
  return review ? cloneReview(review) : undefined;
}

export function listEvolutionGovernanceReviews(filter?: {
  governanceId?: string;
  kind?: EvolutionGovernanceReviewKind;
  status?: EvolutionGovernanceReviewStatus;
}): EvolutionGovernanceReview[] {
  let result = [...reviews.values()];
  if (filter?.governanceId) {
    result = result.filter((r) => r.governanceId === filter.governanceId);
  }
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.reviewKey.localeCompare(b.reviewKey))
    .map(cloneReview);
}

export function clearEvolutionGovernanceReviews(): void {
  reviews.clear();
  keys.clear();
}
