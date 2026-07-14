/**
 * E02-P5 — Similar Tender Intelligence Engine types
 * Tender context → Similar Tender Profile lifecycle
 */

import type { KnowledgeNodeKind } from "../knowledge/knowledge.types";
import type { KnowledgeContext } from "../retrieval/retrieval.types";

export const V102_SIMILAR_TENDER_VERSION = "v102-similar-tender-1" as const;
export const V102_SIMILAR_TENDER_FREEZE_VERSION =
  "v102-similar-tender-freeze-1" as const;

export type SimilarityLifecycleStage = "context" | "matches" | "profile";

export type SimilarTenderProfileStatus =
  | "pending"
  | "matched"
  | "ready"
  | "failed";

export type SimilarityDimension =
  | "project_type"
  | "equipment"
  | "standard"
  | "budget"
  | "requirement"
  | "deliverable"
  | "location"
  | "clause";

export type TenderFeatureFingerprint = {
  id: string;
  sourceContextId: string;
  labels: string[];
  kinds: KnowledgeNodeKind[];
  keywords: string[];
  dimensions: SimilarityDimension[];
  readOnly: true;
};

export type SimilarTenderMatch = {
  id: string;
  rank: number;
  title: string;
  sector: string;
  locationHint: string;
  budgetBand: string;
  overlapScore: number;
  overlapDimensions: SimilarityDimension[];
  sharedSignals: string[];
  reuseHints: string[];
  readOnly: true;
};

export type SimilarTenderProfile = {
  id: string;
  status: SimilarTenderProfileStatus;
  title: string;
  contextId: string;
  fingerprintId: string;
  matchCount: number;
  topScore: number;
  dimensionCoverage: SimilarityDimension[];
  fingerprint: TenderFeatureFingerprint;
  matches: SimilarTenderMatch[];
  insights: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type SimilarityLifecycleTransition = {
  from: SimilarityLifecycleStage;
  to: SimilarityLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type SimilarityLifecycle = {
  current: SimilarityLifecycleStage;
  stages: SimilarityLifecycleStage[];
  transitions: SimilarityLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type SimilarityKernelInput = {
  deploymentId?: string;
  context: KnowledgeContext;
  titleHint?: string;
  limit?: number;
  minOverlapScore?: number;
};

export type SimilarityKernelResult = {
  version: typeof V102_SIMILAR_TENDER_VERSION;
  freezeVersion: typeof V102_SIMILAR_TENDER_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  context: KnowledgeContext;
  fingerprint: TenderFeatureFingerprint;
  matches: SimilarTenderMatch[];
  profile: SimilarTenderProfile | null;
  lifecycle: SimilarityLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
