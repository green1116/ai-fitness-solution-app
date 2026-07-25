/**
 * Product P7 — Review types
 */

import type { REVIEW_STATUSES } from "../collaboration/collaboration.constants";

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ReviewMetadata = Record<string, unknown>;

export type CollaborationReview = {
  id: string;
  collaborationId: string;
  reviewer: string;
  status: ReviewStatus;
  notes: string;
  detail: string;
  metadata: ReviewMetadata;
  startedAt: string;
  completedAt?: string;
};

export type StartReviewInput = {
  id?: string;
  collaborationId: string;
  reviewer: string;
  notes?: string;
  metadata?: ReviewMetadata;
};

export type CompleteReviewInput = {
  reviewId: string;
  notes?: string;
};
