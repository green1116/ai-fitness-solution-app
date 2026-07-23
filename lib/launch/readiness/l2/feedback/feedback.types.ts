/**
 * Launch L2 — Feedback types
 */

import type { FEEDBACK_CHANNELS } from "../pilot/pilot.constants";

export type FeedbackChannel = (typeof FEEDBACK_CHANNELS)[number];
export type FeedbackMetadata = Record<string, unknown>;

export type FeedbackEntry = {
  id: string;
  pilotId: string;
  channel: FeedbackChannel;
  comment: string;
  rating: number;
  detail: string;
  metadata: FeedbackMetadata;
  collectedAt: string;
};

export type CollectFeedbackInput = {
  id?: string;
  pilotId: string;
  channel: FeedbackChannel;
  comment: string;
  rating: number;
  metadata?: FeedbackMetadata;
};

export type FeedbackScore = {
  id: string;
  pilotId: string;
  entryCount: number;
  averageRating: number;
  npsProxy: number;
  detail: string;
  scoredAt: string;
};

export type ScoreFeedbackInput = {
  id?: string;
  pilotId: string;
};
