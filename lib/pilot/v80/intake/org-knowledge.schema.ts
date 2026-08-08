/**
 * V80 Pilot P12 — Organization knowledge learning schema (additive, session-derived)
 */

export const ORG_KNOWLEDGE_VERSION = "v80-pilot-p12-org-knowledge-1";

export type OrgKnowledgePatternKind =
  | "requirement"
  | "clarification"
  | "compliance"
  | "equipment"
  | "standard";

export type OrgKnowledgePattern = {
  id: string;
  kind: OrgKnowledgePatternKind;
  key: string;
  title: string;
  example: string;
  frequency: number;
  sourceSessionIds: string[];
  tags: string[];
  /** Optional structured hint for reviewers */
  suggestion: string;
  lastSeenAt: string;
};

export type OrgKnowledgeRecommendation = {
  id: string;
  patternId: string;
  kind: OrgKnowledgePatternKind;
  title: string;
  reason: string;
  suggestion: string;
  confidence: number;
  relatedFieldPath?: string;
  /** P13 — trust indicators (added by governance layer) */
  trust?: {
    band: string;
    score: number;
    authority: string;
    freshness: string;
    status: string;
    labels: string[];
    suppressed?: boolean;
    fallback?: boolean;
    conflictOf?: string;
  };
};

export type OrgKnowledgeLibrary = {
  version: typeof ORG_KNOWLEDGE_VERSION;
  organizationId: string;
  builtAt: string;
  contentHash: string;
  sourceSessionCount: number;
  patterns: OrgKnowledgePattern[];
  summary: {
    requirementPatterns: number;
    clarificationPatterns: number;
    compliancePatterns: number;
    equipmentPatterns: number;
    standardPatterns: number;
  };
};

export type OrgKnowledgeLookupResult = {
  organizationId: string;
  sessionId?: string;
  lookedUpAt: string;
  recommendations: OrgKnowledgeRecommendation[];
  libraryBuiltAt?: string;
  libraryHash?: string;
  /** P13 — present after governance enrichment */
  governance?: {
    libraryRevision: number;
    libraryFreshness: string;
    libraryContentHash: string;
    usedFallback: boolean;
    suppressedCount: number;
    activeCount: number;
    deprecatedVisible: number;
  };
};
