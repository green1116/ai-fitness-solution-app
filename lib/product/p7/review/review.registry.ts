/**
 * Product P7 — Review registry
 */

import { REVIEW_STATUSES } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  CollaborationReview,
  CompleteReviewInput,
  StartReviewInput,
} from "./review.types";

const reviews = new Map<string, CollaborationReview>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReview(review: CollaborationReview): CollaborationReview {
  return { ...review, metadata: { ...review.metadata } };
}

export function startReview(input: StartReviewInput): CollaborationReview {
  const collaborationId = input.collaborationId.trim();
  const reviewer = input.reviewer.trim();
  if (!collaborationId) throw new Error("review.collaborationId is required");
  if (!reviewer) throw new Error("review.reviewer is required");
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7rev");
  if (reviews.has(id)) {
    throw new Error(`review already exists: ${id}`);
  }

  const status = REVIEW_STATUSES[1];
  const notes = (input.notes ?? "").trim();
  const review: CollaborationReview = {
    id,
    collaborationId,
    reviewer,
    status,
    notes,
    detail: `status=${status} reviewer=${reviewer}`,
    metadata: { ...(input.metadata ?? {}) },
    startedAt: nowIso(),
  };
  reviews.set(id, review);
  return cloneReview(review);
}

export function completeReview(
  input: CompleteReviewInput,
): CollaborationReview {
  const reviewId = input.reviewId.trim();
  if (!reviewId) throw new Error("review.reviewId is required");
  const existing = reviews.get(reviewId);
  if (!existing) throw new Error(`review not found: ${reviewId}`);
  if (existing.status === "COMPLETE") {
    throw new Error(`review already complete: ${reviewId}`);
  }

  const notes = (input.notes ?? existing.notes).trim();
  const updated: CollaborationReview = {
    ...existing,
    status: "COMPLETE",
    notes,
    detail: `status=COMPLETE reviewer=${existing.reviewer}`,
    metadata: { ...existing.metadata },
    completedAt: nowIso(),
  };
  reviews.set(reviewId, updated);
  return cloneReview(updated);
}

export function getReview(id: string): CollaborationReview | undefined {
  const review = reviews.get(id.trim());
  return review ? cloneReview(review) : undefined;
}

export function listReviews(filter?: {
  collaborationId?: string;
}): CollaborationReview[] {
  let result = [...reviews.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((r) => r.collaborationId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReview);
}

export function clearReviews(): void {
  reviews.clear();
}
