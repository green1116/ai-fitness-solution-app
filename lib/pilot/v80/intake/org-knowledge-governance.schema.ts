/**
 * V80 Pilot P13 — Organization knowledge governance schema (additive)
 */

export const ORG_KNOWLEDGE_GOVERNANCE_VERSION = "v80-pilot-p13-governance-1";

/** Freshness windows (days) — deterministic thresholds */
export const KNOWLEDGE_FRESH_DAYS = 90;
export const KNOWLEDGE_AGING_DAYS = 180;
export const LIBRARY_FRESH_DAYS = 30;
export const LIBRARY_STALE_DAYS = 90;

export type KnowledgeAuthorityLevel =
  | "learned"
  | "reviewed"
  | "promoted"
  | "canonical";

export type KnowledgeLifecycleStatus = "active" | "deprecated" | "archived";

export type KnowledgeFreshnessBand = "fresh" | "aging" | "stale" | "unknown";

export type KnowledgeTrustBand = "high" | "medium" | "low" | "fallback";

export type KnowledgeGovernanceAction =
  | "learned"
  | "rebuild_sync"
  | "promote"
  | "demote"
  | "deprecate"
  | "archive"
  | "restore"
  | "override";

export type KnowledgeLineageEntry = {
  id: string;
  at: string;
  actorId: string;
  action: KnowledgeGovernanceAction;
  fromStatus?: KnowledgeLifecycleStatus;
  toStatus?: KnowledgeLifecycleStatus;
  fromAuthority?: KnowledgeAuthorityLevel;
  toAuthority?: KnowledgeAuthorityLevel;
  note?: string;
  libraryRevision?: number;
  libraryContentHash?: string;
};

export type KnowledgeGovernanceEntry = {
  patternId: string;
  entryVersion: number;
  status: KnowledgeLifecycleStatus;
  authority: KnowledgeAuthorityLevel;
  authorityScore: number;
  freshness: KnowledgeFreshnessBand;
  freshnessScore: number;
  trustScore: number;
  trustBand: KnowledgeTrustBand;
  promotedAt?: string;
  promotedBy?: string;
  deprecatedAt?: string;
  deprecatedBy?: string;
  deprecationReason?: string;
  archivedAt?: string;
  archivedBy?: string;
  /** Manual suggestion override (does not mutate learned pattern text) */
  overrideSuggestion?: string;
  notes?: string;
  lineage: KnowledgeLineageEntry[];
  updatedAt: string;
};

export type KnowledgeGovernanceAuditEntry = {
  id: string;
  at: string;
  actorId: string;
  action: KnowledgeGovernanceAction;
  patternId?: string;
  message: string;
  meta?: Record<string, unknown>;
};

export type OrgKnowledgeGovernanceState = {
  version: typeof ORG_KNOWLEDGE_GOVERNANCE_VERSION;
  organizationId: string;
  /** Monotonic revision — bumps on rebuild sync and governance mutations */
  libraryRevision: number;
  parentContentHash?: string;
  libraryContentHash: string;
  libraryFreshness: KnowledgeFreshnessBand;
  entries: Record<string, KnowledgeGovernanceEntry>;
  audit: KnowledgeGovernanceAuditEntry[];
  updatedAt: string;
};

export type RecommendationTrustIndicator = {
  band: KnowledgeTrustBand;
  score: number;
  authority: KnowledgeAuthorityLevel;
  freshness: KnowledgeFreshnessBand;
  status: KnowledgeLifecycleStatus;
  labels: string[];
  suppressed?: boolean;
  fallback?: boolean;
  conflictOf?: string;
};

export type GovernedOrgKnowledgeRecommendation = {
  id: string;
  patternId: string;
  kind: string;
  title: string;
  reason: string;
  suggestion: string;
  confidence: number;
  relatedFieldPath?: string;
  trust: RecommendationTrustIndicator;
};

export type KnowledgeGovernanceLookupMeta = {
  libraryRevision: number;
  libraryFreshness: KnowledgeFreshnessBand;
  libraryContentHash: string;
  usedFallback: boolean;
  suppressedCount: number;
  activeCount: number;
  deprecatedVisible: number;
};
