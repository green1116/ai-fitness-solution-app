/**
 * Product P4 — Space analysis types
 */

import type { SPACE_ANALYSIS_STATUSES } from "../questionnaire/questionnaire.constants";

export type SpaceAnalysisStatus =
  (typeof SPACE_ANALYSIS_STATUSES)[number];
export type SpaceAnalysisMetadata = Record<string, unknown>;

export type SpaceAnalysis = {
  id: string;
  projectRef: string;
  siteLabel: string;
  areaSqm: number;
  usableRatio: number;
  status: SpaceAnalysisStatus;
  detail: string;
  metadata: SpaceAnalysisMetadata;
  analyzedAt: string;
};

export type AnalyzeSpaceInput = {
  id?: string;
  projectRef: string;
  siteLabel: string;
  areaSqm: number;
  usableRatio: number;
  metadata?: SpaceAnalysisMetadata;
};
