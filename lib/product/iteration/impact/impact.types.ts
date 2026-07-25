/**
 * Product Iteration — Impact types
 */

import type { IMPACT_BANDS } from "../cycle/cycle.constants";

export type ImpactBand = (typeof IMPACT_BANDS)[number];
export type ImpactMetadata = Record<string, unknown>;

export type ImpactScore = {
  id: string;
  cycleId: string;
  subjectRef: string;
  score: number;
  band: ImpactBand;
  detail: string;
  metadata: ImpactMetadata;
  scoredAt: string;
};

export type ScoreImpactInput = {
  id?: string;
  cycleId: string;
  subjectRef: string;
  score: number;
  metadata?: ImpactMetadata;
};
