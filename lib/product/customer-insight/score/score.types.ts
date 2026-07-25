/**
 * Product Customer Insight — Score types
 */

import type { INSIGHT_SCORE_KINDS } from "../insight/insight.constants";

export type InsightScoreKind = (typeof INSIGHT_SCORE_KINDS)[number];
export type ScoreMetadata = Record<string, unknown>;

export type CustomerInsightScore = {
  id: string;
  customerId: string;
  kind: InsightScoreKind;
  value: number;
  detail: string;
  metadata: ScoreMetadata;
  scoredAt: string;
};

export type ComputeScoreInput = {
  id?: string;
  customerId: string;
  kind: InsightScoreKind;
  value: number;
  metadata?: ScoreMetadata;
};
