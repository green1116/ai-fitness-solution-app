export const EVIDENCE_INTELLIGENCE_NETWORK_VERSION = "v39-evidence-intelligence-network-1" as const;
export const EVIDENCE_INTELLIGENCE_NETWORK_TAG = "v39-evidence-intelligence-network-foundation" as const;
export const EVIDENCE_INTELLIGENCE_NETWORK_P1_TAG = "v39-evidence-intelligence-network-p1" as const;
export const EVIDENCE_INTELLIGENCE_NETWORK_P2_TAG = "v39-evidence-intelligence-network-p2" as const;
export const EVIDENCE_INTELLIGENCE_NETWORK_P3_TAG = "v39-evidence-intelligence-network-p3" as const;

export const EVIDENCE_GRAPH_MIN_NODE_COUNT = 40 as const;
export const EVIDENCE_GRAPH_MIN_EDGE_COUNT = 50 as const;
export const EVIDENCE_GRAPH_MIN_BRAND_NODES = 8 as const;
export const EVIDENCE_GRAPH_MIN_EVIDENCE_NODES = 30 as const;
export const EVIDENCE_GRAPH_MIN_REQUIREMENT_STUB_PATHS = 3 as const;

export const COVERAGE_MIN_STUB_PATHS = 3 as const;
export const TENDER_COVERAGE_KIND_THRESHOLD = 60 as const;
export const REQUIREMENT_EDGE_MIN_MATCH_SCORE = 50 as const;

export type EvidenceIntelligenceMode = "evidence-intelligence-network";

export type EvidenceStatus =
  | "draft"
  | "registered"
  | "verified"
  | "linked"
  | "covered"
  | "expired"
  | "archived";

export type EvidenceKind =
  | "certificate"
  | "datasheet"
  | "test-report"
  | "authorization"
  | "case-study"
  | "project-reference";

export type EvidenceSourceLayer =
  | "v20-real-catalog"
  | "v26-brand-portal"
  | "v38-brand-intelligence-network"
  | "v39-evidence-intelligence-network";

export interface EvidenceScore {
  scoreId: string;
  evidenceId: string;
  authenticityScore: number;
  completenessScore: number;
  freshnessScore: number;
  linkageScore: number;
  totalEvidenceScore: number;
  mode: EvidenceIntelligenceMode;
}

export interface EvidenceEngineCompatibility {
  brandIntelligenceLayer: string;
  evidenceRuntimeLayer: string;
  brandPortalLayer: string;
  realCatalogFoundation: string;
  requirementIntelligenceLayer: string;
}

export interface EvidenceRecord {
  evidenceId: string;
  evidenceRef: string;
  brandId: string;
  manufacturerId?: string;
  sku?: string;
  evidenceKind: EvidenceKind;
  evidenceStatus: EvidenceStatus;
  title: string;
  sourceLayer: EvidenceSourceLayer;
  documentRef?: string;
  validUntil?: string;
  brandLinkId: string;
  requirementLinkIds: string[];
  graphNodeIds: string[];
  score: EvidenceScore;
  metadata: Record<string, string>;
  compatibility: EvidenceEngineCompatibility;
  mode: EvidenceIntelligenceMode;
}

export interface EvidenceRegistry {
  registryId: string;
  records: EvidenceRecord[];
  recordCount: number;
  kindBreakdown: Record<EvidenceKind, number>;
  statusBreakdown: Record<EvidenceStatus, number>;
  brandBreakdown: Record<string, number>;
  registryReady: boolean;
  mode: EvidenceIntelligenceMode;
}

export interface EvidenceRegistryContext {
  contextId: string;
  records: EvidenceRecord[];
  recordCount: number;
  kindBreakdown: Record<EvidenceKind, number>;
  brandCoverage: number;
  averageScore: number;
  contextReady: boolean;
  mode: EvidenceIntelligenceMode;
}

export interface EvidenceQuery {
  brandId?: string;
  evidenceKind?: EvidenceKind;
  evidenceStatus?: EvidenceStatus;
  minEvidenceScore?: number;
  limit?: number;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface EvidenceIntelligenceNetworkValidation {
  valid: boolean;
  evidenceRegistry: RegistryValidation;
  evidenceContext: RegistryValidation;
  engineCompatibility: RegistryValidation;
}

export interface EvidenceGraphValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface EvidenceIntelligenceNetworkPhase2Validation {
  valid: boolean;
  phase1: EvidenceIntelligenceNetworkValidation;
  evidenceGraph: EvidenceGraphValidation;
}

export type EvidenceCoverageLevel = "full" | "partial" | "minimal" | "none" | "expired";

export type EvidenceCoverageTargetType = "brand" | "tender" | "requirement" | "proposal";

export type RequirementType =
  | "technical-compliance"
  | "commercial-qualification"
  | "brand-authorization"
  | "case-reference"
  | "equipment-spec";

export interface EvidenceCoverageRecord {
  coverageId: string;
  targetType: EvidenceCoverageTargetType;
  targetId: string;
  brandId?: string;
  tenderId?: string;
  proposalId?: string;
  requirementId?: string;
  evidenceIds: string[];
  coverageLevel: EvidenceCoverageLevel;
  coverageScore: number;
  kindBreakdown: Partial<Record<EvidenceKind, number>>;
  gapKinds: EvidenceKind[];
  expiredCount: number;
  coverageReady: boolean;
  mode: EvidenceIntelligenceMode;
}

export interface EvidenceCoverageContext {
  contextId: string;
  records: EvidenceCoverageRecord[];
  recordCount: number;
  levelBreakdown: Record<EvidenceCoverageLevel, number>;
  targetBreakdown: Record<EvidenceCoverageTargetType, number>;
  averageScore: number;
  gapBrandCount: number;
  stubPathCount: number;
  contextReady: boolean;
  mode: EvidenceIntelligenceMode;
}

export interface RequirementStub {
  requirementId: string;
  tenderId: string;
  proposalId?: string;
  brandId: string;
  requirementType: RequirementType;
  mandatory: boolean;
  evidenceLinkIds: string[];
  stubReady: boolean;
  mode: EvidenceIntelligenceMode;
}

export interface RequirementEvidenceEdge {
  edgeId: string;
  requirementId: string;
  evidenceId: string;
  brandId: string;
  matchScore: number;
  traceRef: string;
  sourceRecordId: string;
  mode: EvidenceIntelligenceMode;
}

export interface RequirementStubValidation {
  valid: boolean;
  stubCount: number;
  edgeCount: number;
  readyCount: number;
  pathCount: number;
  summary: string;
}

export interface EvidenceCoverageValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface EvidenceIntelligenceNetworkPhase3Validation {
  valid: boolean;
  phase2: EvidenceIntelligenceNetworkPhase2Validation;
  evidenceCoverage: EvidenceCoverageValidation;
  requirementStub: RequirementStubValidation;
}

export interface EvidenceCoveragePath {
  brandId: string;
  requirementId: string;
  evidenceId: string;
  nodeIds: string[];
  edgeIds: string[];
  pathKind: "brand-evidence-requirement";
  matchScore: number;
  traceRefs: string[];
}

export const CANONICAL_EVIDENCE_QUERY: EvidenceQuery = {
  brandId: "brand-life-fitness",
  evidenceKind: "certificate",
  limit: 5,
} as const;

export const TOP_EVIDENCE_SCORE_THRESHOLD = 78 as const;

export const EVIDENCE_KINDS: EvidenceKind[] = [
  "certificate",
  "datasheet",
  "test-report",
  "authorization",
  "case-study",
  "project-reference",
];

export const EVIDENCE_STATUSES: EvidenceStatus[] = [
  "draft",
  "registered",
  "verified",
  "linked",
  "covered",
  "expired",
  "archived",
];

export const ACTIVE_EVIDENCE_BRAND_STATUSES = [
  "active",
  "verified",
  "authorized",
  "matched",
] as const;
