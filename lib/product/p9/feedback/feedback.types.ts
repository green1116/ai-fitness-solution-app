/**
 * Product P9 — Feedback types
 */

import type { FEEDBACK_KINDS } from "../customer-health/health.constants";

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export type FeedbackMetadata = Record<string, unknown>;

export type CustomerFeedback = {
  id: string;
  healthId: string;
  kind: FeedbackKind;
  author: string;
  score?: number;
  body: string;
  detail: string;
  metadata: FeedbackMetadata;
  createdAt: string;
};

export type CreateFeedbackInput = {
  id?: string;
  healthId: string;
  kind: FeedbackKind;
  author: string;
  score?: number;
  body: string;
  metadata?: FeedbackMetadata;
};
