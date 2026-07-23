/**
 * Operations O4 — Cohort types
 */

import type { COHORT_PERIODS } from "../growth/growth.constants";

export type CohortPeriod = (typeof COHORT_PERIODS)[number];
export type CohortMetadata = Record<string, unknown>;

export type CohortAnalysis = {
  id: string;
  accountRef: string;
  period: CohortPeriod;
  cohortLabel: string;
  size: number;
  retainedRate: number;
  detail: string;
  metadata: CohortMetadata;
  analyzedAt: string;
};

export type AnalyzeCohortInput = {
  id?: string;
  accountRef: string;
  period: CohortPeriod;
  cohortLabel: string;
  size: number;
  retainedCount: number;
  metadata?: CohortMetadata;
};

export type CohortReport = {
  id: string;
  title: string;
  accountRef: string;
  analysisCount: number;
  averageRetainedRate: number;
  highlights: string[];
  detail: string;
  generatedAt: string;
};

export type GenerateCohortReportInput = {
  id?: string;
  title?: string;
  accountRef: string;
};
