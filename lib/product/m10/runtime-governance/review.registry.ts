/**
 * Product M10 — AI Runtime Governance review registry (record only)
 */

import { AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS } from "./governance.constants";
import { getAiRuntimeGovernancePolicy } from "./policy.registry";
import { getAiRuntimeGovernanceStandard } from "./standard.registry";
import type {
  AiRuntimeGovernanceReview,
  AiRuntimeGovernanceReviewVerdict,
  RecordAiRuntimeGovernanceReviewInput,
} from "./governance.types";

const reviews = new Map<string, AiRuntimeGovernanceReview>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReview(
  review: AiRuntimeGovernanceReview,
): AiRuntimeGovernanceReview {
  return { ...review, metadata: { ...review.metadata } };
}

export function recordAiRuntimeGovernanceReview(
  input: RecordAiRuntimeGovernanceReviewInput,
): AiRuntimeGovernanceReview {
  const policyId = input.policyId.trim();
  const standardId = input.standardId.trim();
  const reviewKey = input.reviewKey.trim().toUpperCase();
  const subjectRef = input.subjectRef.trim().toUpperCase();
  if (!policyId) throw new Error("review.policyId is required");
  if (!standardId) throw new Error("review.standardId is required");
  if (!reviewKey) throw new Error("review.reviewKey is required");
  if (!subjectRef) throw new Error("review.subjectRef is required");
  if (
    !(AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS as readonly string[]).includes(
      input.verdict,
    )
  ) {
    throw new Error(`invalid review verdict: ${input.verdict}`);
  }

  const policy = getAiRuntimeGovernancePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);
  if (policy.status !== "ACTIVE") {
    throw new Error(`policy not active: ${policyId}`);
  }

  const standard = getAiRuntimeGovernanceStandard(standardId);
  if (!standard) throw new Error(`standard not found: ${standardId}`);
  if (standard.policyId !== policyId) {
    throw new Error(`standard policy mismatch: ${standardId}`);
  }

  const duplicate = [...reviews.values()].find(
    (r) => r.policyId === policyId && r.reviewKey === reviewKey,
  );
  if (duplicate) throw new Error(`reviewKey already exists: ${reviewKey}`);

  const id = input.id?.trim() || createId("airtgrev");
  if (reviews.has(id)) throw new Error(`review already exists: ${id}`);

  const review: AiRuntimeGovernanceReview = {
    id,
    policyId,
    standardId,
    reviewKey,
    subjectRef,
    verdict: input.verdict,
    detail: `verdict=${input.verdict} subject=${subjectRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  reviews.set(id, review);
  return cloneReview(review);
}

export function getAiRuntimeGovernanceReview(
  id: string,
): AiRuntimeGovernanceReview | undefined {
  const review = reviews.get(id.trim());
  return review ? cloneReview(review) : undefined;
}

export function listAiRuntimeGovernanceReviews(filter?: {
  policyId?: string;
  verdict?: AiRuntimeGovernanceReviewVerdict;
}): AiRuntimeGovernanceReview[] {
  let result = [...reviews.values()];
  if (filter?.policyId) {
    const policyId = filter.policyId.trim();
    result = result.filter((r) => r.policyId === policyId);
  }
  if (filter?.verdict) {
    result = result.filter((r) => r.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.reviewKey.localeCompare(b.reviewKey))
    .map(cloneReview);
}

export function clearAiRuntimeGovernanceReviews(): void {
  reviews.clear();
}
