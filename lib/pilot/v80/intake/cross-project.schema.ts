/**
 * V80 Pilot P17 — Cross-project intelligence schema (read-only similarity)
 */

export const CROSS_PROJECT_VERSION = "v80-pilot-p17-cross-project-1";

export type ProjectFingerprintFeatures = {
  industry: string;
  location: string;
  projectName: string;
  scope: string;
  status: string;
  hasProductionProject: boolean;
  qaPassed: boolean;
  signedOff: boolean;
  equipmentTexts: string[];
  standardTexts: string[];
  requirementTexts: string[];
  clarificationFields: string[];
  clarificationQuestions: string[];
  complianceRuleIds: string[];
  complianceTitles: string[];
  bootstrapReady: boolean;
  milestoneTitles: string[];
  taskTitles: string[];
  documentCount: number;
};

export type ProjectFingerprint = {
  sessionId: string;
  organizationId: string;
  tenderIntakeId: string;
  productionProjectId?: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  features: ProjectFingerprintFeatures;
  /** Sorted unique tokens used for text similarity */
  tokens: string[];
  tokenHash: string;
  contentHash: string;
};

export type SimilarityDimensionScore = {
  id: string;
  label: string;
  weight: number;
  score: number;
};

export type SimilarProjectMatch = {
  sessionId: string;
  label: string;
  status: string;
  productionProjectId?: string;
  similarity: number;
  dimensions: SimilarityDimensionScore[];
  overlapSummary: string;
  fingerprint: ProjectFingerprint;
};

export type ReusableArtifactKind =
  | "requirement"
  | "equipment"
  | "standard"
  | "clarification"
  | "compliance"
  | "execution";

export type ReusableArtifact = {
  id: string;
  kind: ReusableArtifactKind;
  title: string;
  detail: string;
  sourceSessionId: string;
  sourceLabel: string;
  similarity: number;
  fieldPath?: string;
};

export type ProjectComparisonRow = {
  dimension: string;
  queryValue: string;
  matchValue: string;
  overlap: number;
};

export type ProjectComparisonView = {
  querySessionId: string;
  matchSessionId: string;
  similarity: number;
  rows: ProjectComparisonRow[];
};

export type CrossProjectInsight = {
  candidatePoolSize: number;
  matchCount: number;
  topSimilarity: number;
  avgTopSimilarity: number;
  reusableArtifactCount: number;
  strengths: string[];
  gaps: string[];
  headline: string;
};

export type CrossProjectSimilarityReport = {
  version: typeof CROSS_PROJECT_VERSION;
  organizationId: string;
  querySessionId: string;
  generatedAt: string;
  contentHash: string;
  queryFingerprint: ProjectFingerprint;
  matches: SimilarProjectMatch[];
  reuseArtifacts: ReusableArtifact[];
  comparison?: ProjectComparisonView;
  insight: CrossProjectInsight;
};

export type CrossProjectExplorerReport = {
  version: typeof CROSS_PROJECT_VERSION;
  organizationId: string;
  generatedAt: string;
  contentHash: string;
  fingerprints: ProjectFingerprint[];
  /** Top pairs across completed projects */
  topPairs: Array<{
    leftSessionId: string;
    rightSessionId: string;
    leftLabel: string;
    rightLabel: string;
    similarity: number;
  }>;
  insight: {
    projectCount: number;
    pairCount: number;
    avgPairSimilarity: number;
    headline: string;
  };
};
