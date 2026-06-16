export const REQUIREMENT_INTELLIGENCE_VERSION = "v40-requirement-intelligence-1" as const;
export const REQUIREMENT_INTELLIGENCE_TAG = "v40-requirement-intelligence-foundation" as const;
export const REQUIREMENT_INTELLIGENCE_P1_TAG = "v40-requirement-intelligence-p1" as const;
export const REQUIREMENT_INTELLIGENCE_P2_TAG = "v40-requirement-intelligence-p2" as const;
export const REQUIREMENT_INTELLIGENCE_P3_TAG = "v40-requirement-intelligence-p3" as const;
export const REQUIREMENT_INTELLIGENCE_P4_TAG = "v40-requirement-intelligence-p4" as const;

export const REQUIREMENT_READINESS_MIN_SCORE = 70 as const;
export const REQUIREMENT_READINESS_MIN_READY_COUNT = 10 as const;
export const REQUIREMENT_READINESS_MIN_PARTIAL_COUNT = 10 as const;
export const REQUIREMENT_READINESS_MIN_BLOCKED_COUNT = 1 as const;
export const REQUIREMENT_MATCHER_MIN_MATCH_SCORE = 50 as const;

export const REQUIREMENT_COMPLIANCE_MIN_RECORDS = 50 as const;
export const REQUIREMENT_COMPLIANCE_MIN_MATRIX_RECORDS = 50 as const;
export const REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT = 10 as const;
export const REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT = 10 as const;
export const REQUIREMENT_COMPLIANCE_MIN_FAIL_COUNT = 1 as const;
export const REQUIREMENT_COMPLIANCE_PASS_THRESHOLD = 75 as const;
export const REQUIREMENT_COMPLIANCE_PARTIAL_THRESHOLD = 50 as const;
export const REQUIREMENT_COMPLIANCE_READINESS_LOW_THRESHOLD = 55 as const;

export const REQUIREMENT_GRAPH_MIN_NODE_COUNT = 80 as const;
export const REQUIREMENT_GRAPH_MIN_EDGE_COUNT = 120 as const;
export const REQUIREMENT_GRAPH_MIN_TENDER_NODES = 15 as const;
export const REQUIREMENT_GRAPH_MIN_REQUIREMENT_NODES = 50 as const;
export const REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES = 30 as const;
export const REQUIREMENT_GRAPH_MIN_BRAND_NODES = 8 as const;
export const REQUIREMENT_GRAPH_MIN_TENDER_EVIDENCE_PATHS = 3 as const;

export type RequirementIntelligenceMode = "requirement-intelligence";

export type RequirementStatus =
  | "draft"
  | "active"
  | "archived"
  | "expired"
  | "matched";

export type RequirementKind =
  | "equipment"
  | "service"
  | "installation"
  | "maintenance"
  | "compliance"
  | "authorization"
  | "reference"
  | "commercial";

export type RequirementPriority = "critical" | "high" | "medium" | "low";

export type RequirementSource =
  | "v39-evidence-stub"
  | "v28-requirement-profile"
  | "v34-requirement-anchor"
  | "v36-tender-requirement"
  | "v40-requirement-intelligence";

export type RequirementMandatoryLevel = "mandatory" | "optional" | "recommended";

export interface RequirementScore {
  scoreId: string;
  requirementId: string;
  completenessScore: number;
  clarityScore: number;
  evidenceLinkScore: number;
  priorityAlignmentScore: number;
  freshnessScore: number;
  confidenceScore: number;
  totalRequirementScore: number;
  mode: RequirementIntelligenceMode;
}

export interface RequirementEngineCompatibility {
  evidenceIntelligenceLayer: string;
  brandIntelligenceLayer: string;
  tenderMarketplaceLayer: string;
  tenderHubLayer: string;
  industryWorkflowLayer: string;
}

export interface RequirementRecord {
  requirementId: string;
  requirementRef: string;
  tenderId: string;
  brandId?: string;
  proposalId?: string;
  anchorId?: string;
  requirementType: string;
  requirementKind: RequirementKind;
  requirementStatus: RequirementStatus;
  priority: RequirementPriority;
  source: RequirementSource;
  mandatoryLevel: RequirementMandatoryLevel;
  title: string;
  description: string;
  evidenceLinkIds: string[];
  matchScore: number;
  coverageScore: number;
  confidenceScore: number;
  score: RequirementScore;
  metadata: Record<string, string>;
  compatibility: RequirementEngineCompatibility;
  mode: RequirementIntelligenceMode;
}

export interface RequirementRegistry {
  registryId: string;
  records: RequirementRecord[];
  recordCount: number;
  kindBreakdown: Record<RequirementKind, number>;
  sourceBreakdown: Record<RequirementSource, number>;
  statusBreakdown: Record<RequirementStatus, number>;
  registryReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementRegistryContext {
  contextId: string;
  records: RequirementRecord[];
  recordCount: number;
  kindBreakdown: Record<RequirementKind, number>;
  sourceBreakdown: Record<RequirementSource, number>;
  tenderCoverage: number;
  brandCoverage: number;
  averageScore: number;
  contextReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementQuery {
  tenderId?: string;
  brandId?: string;
  proposalId?: string;
  requirementKind?: RequirementKind;
  requirementStatus?: RequirementStatus;
  priority?: RequirementPriority;
  source?: RequirementSource;
  minRequirementScore?: number;
  limit?: number;
}

export interface RequirementValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface RequirementIntelligenceNetworkValidation {
  valid: boolean;
  requirementRegistry: RequirementValidation;
  requirementContext: RequirementValidation;
  engineCompatibility: RequirementValidation;
}

export interface RequirementGraphValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface RequirementIntelligencePhase2Validation {
  valid: boolean;
  phase1: RequirementIntelligenceNetworkValidation;
  requirementGraph: RequirementGraphValidation;
}

export type RequirementComplianceStatus = "pass" | "partial" | "fail" | "blocked";

export interface RequirementComplianceFactors {
  evidenceCoverage: number;
  evidenceReadiness: number;
  brandAlignment: number;
  requirementPriority: number;
  freshness: number;
  confidence: number;
}

export interface RequirementGap {
  gapId: string;
  requirementId: string;
  missingEvidenceKinds: string[];
  missingBrandLinks: string[];
  expiredEvidence: string[];
  lowReadinessEvidence: string[];
  criticalBlockers: string[];
  gapScore: number;
  mode: RequirementIntelligenceMode;
}

export interface RequirementComplianceRecord {
  complianceId: string;
  requirementId: string;
  requirementRef: string;
  tenderId: string;
  brandId?: string;
  complianceStatus: RequirementComplianceStatus;
  complianceScore: number;
  factors: RequirementComplianceFactors;
  linkedEvidenceIds: string[];
  gap: RequirementGap;
  riskSummary: string;
  satisfied: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementComplianceMatrixCell {
  cellId: string;
  requirementId: string;
  axisType: "evidence" | "brand" | "tender";
  targetId: string;
  linked: boolean;
  complianceScore: number;
  complianceStatus: RequirementComplianceStatus;
  traceRef: string;
  mode: RequirementIntelligenceMode;
}

export interface RequirementComplianceMatrix {
  matrixId: string;
  cells: RequirementComplianceMatrixCell[];
  cellCount: number;
  requirementEvidenceCells: number;
  requirementBrandCells: number;
  requirementTenderCells: number;
  matrixReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementComplianceContext {
  contextId: string;
  records: RequirementComplianceRecord[];
  recordCount: number;
  passCount: number;
  partialCount: number;
  failCount: number;
  blockedCount: number;
  averageComplianceScore: number;
  tenderComplianceReady: boolean;
  gapAnalysisReady: boolean;
  contextReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementComplianceValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface RequirementIntelligencePhase3Validation {
  valid: boolean;
  phase2: RequirementIntelligencePhase2Validation;
  requirementCompliance: RequirementComplianceValidation;
  requirementComplianceMatrix: RequirementComplianceValidation;
  requirementComplianceGap: RequirementComplianceValidation;
  tenderCompliance: RequirementComplianceValidation;
}

export type RequirementReadinessStatus = "ready" | "partial" | "blocked" | "not-ready";

export interface RequirementReadinessScore {
  readinessId: string;
  requirementId: string;
  registryScore: number;
  graphScore: number;
  complianceScore: number;
  evidenceCoverageScore: number;
  evidenceReadinessScore: number;
  freshnessScore: number;
  confidenceScore: number;
  priorityAlignmentScore: number;
  totalRequirementReadiness: number;
  mode: RequirementIntelligenceMode;
}

export interface RequirementReadinessResult {
  resultId: string;
  requirementId: string;
  requirementRef: string;
  tenderId: string;
  brandId?: string;
  score: RequirementReadinessScore;
  readinessStatus: RequirementReadinessStatus;
  criticalBlockers: string[];
  warningItems: string[];
  readinessReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementReadinessContext {
  contextId: string;
  results: RequirementReadinessResult[];
  resultCount: number;
  readyCount: number;
  partialCount: number;
  blockedCount: number;
  notReadyCount: number;
  averageReadinessScore: number;
  contextReady: boolean;
  mode: RequirementIntelligenceMode;
}

export type RequirementMatchTargetType = "evidence" | "brand" | "tender" | "proposal";

export interface RequirementMatchResult {
  matchId: string;
  requirementId: string;
  targetType: RequirementMatchTargetType;
  targetId: string;
  brandId?: string;
  matchScore: number;
  matchReason: string;
  matchedIds: string[];
  unmatchedGaps: string[];
  matchReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementQuerySnapshot {
  canonical: RequirementRecord[];
  byTender: RequirementRecord[];
  byBrand: RequirementRecord[];
  byKind: RequirementRecord[];
  byPriority: RequirementRecord[];
  top: RequirementRecord[];
  satisfied: RequirementRecord[];
  blocked: RequirementRecord[];
  critical: RequirementRecord[];
  all: RequirementRecord[];
}

export interface RequirementMatcherContext {
  contextId: string;
  sampleRequirementId?: string;
  canonicalQueryRequirementId?: string;
  evidenceMatch?: RequirementMatchResult;
  brandMatch?: RequirementMatchResult;
  tenderMatch?: RequirementMatchResult;
  proposalMatch?: RequirementMatchResult;
  contextReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementFoundationValidations {
  registry: RequirementValidation;
  requirementContext: RequirementValidation;
  graph: RequirementGraphValidation;
  compliance: RequirementComplianceValidation;
  complianceMatrix: RequirementComplianceValidation;
  complianceGap: RequirementComplianceValidation;
  tenderCompliance: RequirementComplianceValidation;
  readiness: RequirementValidation;
  query: RequirementValidation;
  matcher: RequirementValidation;
  engineCompatibility: RequirementValidation;
  queryRegistry: RequirementValidation;
  evidenceNetwork?: RequirementValidation;
}

export interface RequirementFoundationRegression {
  phase1Valid: boolean;
  phase2Valid: boolean;
  phase3Valid: boolean;
}

export interface RequirementFoundationCanonical {
  requirement?: RequirementRecord;
  readiness?: RequirementReadinessResult;
}

export interface RequirementFoundationContext {
  contextId: string;
  query: RequirementQuerySnapshot;
  readiness: RequirementReadinessContext;
  matcher: RequirementMatcherContext;
  validations: RequirementFoundationValidations;
  regression: RequirementFoundationRegression;
  canonical: RequirementFoundationCanonical;
  contextReady: boolean;
  mode: RequirementIntelligenceMode;
}

export interface RequirementFoundationContextOptions {
  includePhaseRegression?: boolean;
  includeEvidenceNetwork?: boolean;
}

export interface RequirementIntelligencePhase4Validation {
  valid: boolean;
  phase3: RequirementIntelligencePhase3Validation;
  requirementReadiness: RequirementValidation;
  requirementQuery: RequirementValidation;
  requirementMatcher: RequirementValidation;
}

export interface RequirementIntelligenceFoundationValidation {
  valid: boolean;
  phase4: RequirementIntelligencePhase4Validation;
  requirementRegistry: RequirementValidation;
  requirementGraph: RequirementGraphValidation;
  requirementCompliance: RequirementComplianceValidation;
  engineCompatibility: RequirementValidation;
}

export const CANONICAL_REQUIREMENT_MATCHER_TENDER_ID = "tender-sh-commercial-gym-2025-001" as const;
export const CANONICAL_REQUIREMENT_MATCHER_BRAND_ID = "brand-life-fitness" as const;

export const CANONICAL_REQUIREMENT_QUERY: RequirementQuery = {
  tenderId: "tender-sh-commercial-gym-2025-001",
  requirementKind: "equipment",
  limit: 5,
} as const;

export const TOP_REQUIREMENT_SCORE_THRESHOLD = 78 as const;
export const HIGH_PRIORITY_REQUIREMENT_THRESHOLD = 85 as const;

export const REQUIREMENT_KINDS: RequirementKind[] = [
  "equipment",
  "service",
  "installation",
  "maintenance",
  "compliance",
  "authorization",
  "reference",
  "commercial",
];

export const REQUIREMENT_STATUSES: RequirementStatus[] = [
  "draft",
  "active",
  "archived",
  "expired",
  "matched",
];

export const REQUIREMENT_PRIORITIES: RequirementPriority[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const ACTIVE_TENDER_MARKETPLACE_STATUSES = ["open", "awarded"] as const;

export const ACTIVE_TENDER_HUB_STATUSES = [
  "registered",
  "qualified",
  "tracked",
  "matched",
  "proposed",
] as const;
