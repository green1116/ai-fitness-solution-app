/**
 * Operations O4 — Retention types
 */

import type { RETENTION_BANDS } from "../growth/growth.constants";

export type RetentionBand = (typeof RETENTION_BANDS)[number];
export type RetentionMetadata = Record<string, unknown>;

export type RetentionScore = {
  id: string;
  accountRef: string;
  score: number;
  band: RetentionBand;
  retainedUsers: number;
  startingUsers: number;
  detail: string;
  metadata: RetentionMetadata;
  scoredAt: string;
};

export type ScoreRetentionInput = {
  id?: string;
  accountRef: string;
  retainedUsers: number;
  startingUsers: number;
  metadata?: RetentionMetadata;
};

export type RetentionAnalysis = {
  id: string;
  accountRef: string;
  scoreId: string;
  riskFlags: string[];
  recommendation: string;
  detail: string;
  analyzedAt: string;
};

export type AnalyzeRetentionInput = {
  id?: string;
  accountRef: string;
  scoreId?: string;
};
