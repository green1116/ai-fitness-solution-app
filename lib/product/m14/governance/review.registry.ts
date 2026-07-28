/**
 * Product M14 — Intelligence governance review registry (soft matrixKeyRef)
 */

import {
  INTELLIGENCE_GOVERNANCE_APPROVALS,
  INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES,
  INTELLIGENCE_GOVERNANCE_RISK_LEVELS,
} from "./governance.constants";
import { getIntelligenceGovernanceStandard } from "./standard.registry";
import type {
  IntelligenceGovernanceReview,
  IntelligenceGovernanceReviewStatus,
  RegisterIntelligenceGovernanceReviewInput,
  UpdateIntelligenceGovernanceReviewStatusInput,
} from "./governance.types";

const reviews = new Map<string, IntelligenceGovernanceReview>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReview(
  review: IntelligenceGovernanceReview,
): IntelligenceGovernanceReview {
  return { ...review, metadata: { ...review.metadata } };
}

export function registerIntelligenceGovernanceReview(
  input: RegisterIntelligenceGovernanceReviewInput,
): IntelligenceGovernanceReview {
  const standardId = input.standardId.trim();
  const reviewKey = input.reviewKey.trim().toUpperCase();
  const matrixKeyRef = input.matrixKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!standardId) throw new Error("review.standardId is required");
  if (!reviewKey) throw new Error("review.reviewKey is required");
  if (!matrixKeyRef) throw new Error("review.matrixKeyRef is required");
  if (!summary) throw new Error("review.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("review.sequence must be a positive integer");
  }
  if (
    !(INTELLIGENCE_GOVERNANCE_APPROVALS as readonly string[]).includes(
      input.approval,
    )
  ) {
    throw new Error(`invalid review approval: ${input.approval}`);
  }
  if (
    !(INTELLIGENCE_GOVERNANCE_RISK_LEVELS as readonly string[]).includes(
      input.riskLevel,
    )
  ) {
    throw new Error(`invalid review riskLevel: ${input.riskLevel}`);
  }

  const standard = getIntelligenceGovernanceStandard(standardId);
  if (!standard) throw new Error(`standard not found: ${standardId}`);
  if (standard.status !== "ACTIVE" && standard.status !== "DRAFT") {
    throw new Error(`standard not editable: ${standardId}`);
  }

  const duplicateKey = [...reviews.values()].find(
    (r) => r.standardId === standardId && r.reviewKey === reviewKey,
  );
  if (duplicateKey) throw new Error(`reviewKey already exists: ${reviewKey}`);

  const duplicateSeq = [...reviews.values()].find(
    (r) => r.standardId === standardId && r.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`review sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("intgovrev");
  if (reviews.has(id)) throw new Error(`review already exists: ${id}`);

  const now = nowIso();
  const review: IntelligenceGovernanceReview = {
    id,
    standardId,
    reviewKey,
    sequence: input.sequence,
    status: INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES[0],
    approval: input.approval,
    riskLevel: input.riskLevel,
    matrixKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  reviews.set(id, review);
  return cloneReview(review);
}

export function updateIntelligenceGovernanceReviewStatus(
  input: UpdateIntelligenceGovernanceReviewStatusInput,
): IntelligenceGovernanceReview {
  const reviewId = input.reviewId.trim();
  if (!reviewId) throw new Error("review.reviewId is required");
  if (
    !(INTELLIGENCE_GOVERNANCE_REVIEW_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid review status: ${input.status}`);
  }

  const existing = reviews.get(reviewId);
  if (!existing) throw new Error(`review not found: ${reviewId}`);

  const updated: IntelligenceGovernanceReview = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  reviews.set(reviewId, updated);
  return cloneReview(updated);
}

export function getIntelligenceGovernanceReview(
  id: string,
): IntelligenceGovernanceReview | undefined {
  const review = reviews.get(id.trim());
  return review ? cloneReview(review) : undefined;
}

export function listIntelligenceGovernanceReviews(filter?: {
  standardId?: string;
  status?: IntelligenceGovernanceReviewStatus;
}): IntelligenceGovernanceReview[] {
  let result = [...reviews.values()];
  if (filter?.standardId) {
    const standardId = filter.standardId.trim();
    result = result.filter((r) => r.standardId === standardId);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence || a.reviewKey.localeCompare(b.reviewKey))
    .map(cloneReview);
}

export function clearIntelligenceGovernanceReviews(): void {
  reviews.clear();
}
