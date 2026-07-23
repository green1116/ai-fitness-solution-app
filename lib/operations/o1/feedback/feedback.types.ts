/**
 * Operations O1 — Feedback types
 */

import type { FEEDBACK_CHANNELS } from "../success/success.constants";

export type FeedbackChannel = (typeof FEEDBACK_CHANNELS)[number];
export type FeedbackMetadata = Record<string, unknown>;

export type FeedbackEntry = {
  id: string;
  customerId: string;
  channel: FeedbackChannel;
  comment: string;
  rating: number;
  detail: string;
  metadata: FeedbackMetadata;
  collectedAt: string;
};

export type CollectFeedbackInput = {
  id?: string;
  customerId: string;
  channel: FeedbackChannel;
  comment: string;
  rating: number;
  metadata?: FeedbackMetadata;
};

export type FeedbackAnalysis = {
  id: string;
  customerId: string;
  entryCount: number;
  averageRating: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  detail: string;
  analyzedAt: string;
};

export type AnalyzeFeedbackInput = {
  id?: string;
  customerId: string;
};
