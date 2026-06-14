import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

export const TENDER_MARKETPLACE_VERSION = "v28-tender-marketplace-4" as const;
export const TENDER_MARKETPLACE_TAG = "v28-tender-marketplace-foundation" as const;

export type TenderMarketplaceDataMode = "tender-marketplace";

export type TenderMarketplaceStatus = "draft" | "open" | "closed" | "awarded" | "archived";

export type TenderRequirementType = "equipment" | "service" | "installation" | "maintenance";

export type TenderCompetitionLevel = "low" | "medium" | "high";

export type TenderOpportunityStatus = "active" | "closed" | "awarded";

export interface TenderProfile {
  tenderId: string;
  title: string;
  city: string;
  industry: ProjectType;
  budget: number;
  publishDate: string;
  deadline: string;
  status: TenderMarketplaceStatus;
  mode: TenderMarketplaceDataMode;
}

export interface RequirementProfile {
  tenderId: string;
  requirementType: TenderRequirementType;
  equipmentCategory: string;
  quantity: number;
  technicalRequirement: string;
  mandatory: boolean;
  mode: TenderMarketplaceDataMode;
}

export interface EvaluationProfile {
  tenderId: string;
  priceWeight: number;
  technicalWeight: number;
  serviceWeight: number;
  deliveryWeight: number;
  brandWeight: number;
  mode: TenderMarketplaceDataMode;
}

export interface OpportunityProfile {
  tenderId: string;
  estimatedValue: number;
  competitionLevel: TenderCompetitionLevel;
  targetBrands: string[];
  targetSuppliers: string[];
  status: TenderOpportunityStatus;
  mode: TenderMarketplaceDataMode;
}

export interface TenderMarketplaceValidation {
  valid: boolean;
  tenderExists: boolean;
  requirementsExist: boolean;
  evaluationExists: boolean;
  opportunityExists: boolean;
  v20CatalogCompatible: boolean;
  v21SupplierCompatible: boolean;
  v22ProcurementCompatible: boolean;
  v23ProposalCompatible: boolean;
  v24IntelligenceCompatible: boolean;
  v25KnowledgeCompatible: boolean;
}

export interface TenderMarketplaceReport {
  version: typeof TENDER_MARKETPLACE_VERSION;
  reportId: string;
  tenderCount: number;
  requirementCount: number;
  evaluationCount: number;
  opportunityCount: number;
  validation: TenderMarketplaceValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_TENDER_MARKETPLACE_QUERY = {
  tenderId: "tender-sh-commercial-gym-2025-001",
} as const;

export type TenderPublishingStatus =
  | "draft"
  | "submitted"
  | "review"
  | "approved"
  | "published"
  | "rejected";

export const TENDER_PUBLISHING_WORKFLOW_STATES = [
  "draft",
  "submitted",
  "review",
  "approved",
  "published",
] as const;

export interface TenderSubmission {
  submissionId: string;
  tenderProfile: TenderProfile;
  requirements: RequirementProfile[];
  evaluation: EvaluationProfile;
  opportunity: OpportunityProfile;
  submittedAt: string | null;
  status: TenderPublishingStatus;
  mode: TenderMarketplaceDataMode;
}

export interface TenderPublishingIntakeInput {
  tenderId: string;
}

export interface TenderSubmissionValidation {
  valid: boolean;
  tenderExists: boolean;
  requirementsExist: boolean;
  evaluationExists: boolean;
  opportunityExists: boolean;
}

export type TenderApprovalDecision = "approved" | "rejected";

export interface TenderApprovalGate {
  submissionId: string;
  decision: TenderApprovalDecision;
  reasons: string[];
  validatedAt: string;
}

export interface TenderPublishingWorkflowStep {
  status: TenderPublishingStatus;
  completed: boolean;
  current: boolean;
}

export interface TenderPublishingWorkflow {
  submissionId: string;
  currentStatus: TenderPublishingStatus;
  steps: TenderPublishingWorkflowStep[];
  nextStatus: TenderPublishingStatus | null;
}

export interface TenderPublishingReport {
  version: typeof TENDER_MARKETPLACE_VERSION;
  reportId: string;
  submissionCount: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  validation: TenderSubmissionValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_TENDER_PUBLISHING_QUERY = {
  tenderId: "tender-sh-commercial-gym-2025-001",
  submissionId: "publishing-sh-commercial-gym-001",
} as const;

export interface TenderMarketplaceCoverageStats {
  tenderProfileCoverage: number;
  requirementProfileCoverage: number;
  evaluationProfileCoverage: number;
  opportunityProfileCoverage: number;
  publishingCoverage: number;
  approvalWorkflowCoverage: number;
  coverageScore: number;
}

export interface TenderMarketplaceFreezeValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  workflowPathValid: boolean;
  validationScore: number;
}

export interface TenderMarketplaceReadiness {
  readinessScore: number;
  validationScore: number;
  coverageScore: number;
  tenderCount: number;
  requirementCount: number;
  evaluationCount: number;
  opportunityCount: number;
  submissionCount: number;
  approvalCount: number;
  publishedCount: number;
}

export interface TenderMarketplaceWorkflowPathResult {
  tenderId: string;
  tenderTitle: string;
  finalStatus: TenderPublishingStatus;
  approvalDecision: TenderApprovalDecision;
  pathValid: boolean;
}

export interface TenderMarketplaceFreezeReport {
  version: typeof TENDER_MARKETPLACE_VERSION;
  tag: typeof TENDER_MARKETPLACE_TAG;
  reportId: string;
  status: "frozen";
  coverage: TenderMarketplaceCoverageStats;
  validation: TenderMarketplaceFreezeValidation;
  readiness: TenderMarketplaceReadiness;
  workflowPaths: TenderMarketplaceWorkflowPathResult[];
  examplePublishingReport: TenderPublishingReport | null;
  moduleStatistics: {
    frozenDomains: number;
    profileCatalogs: number;
    workflowStates: number;
    validationGates: number;
    reportBuilders: number;
  };
  canonicalQuery: typeof CANONICAL_TENDER_PUBLISHING_QUERY;
  summary: string;
  generatedAt: string;
}

export interface TenderMarketplaceFreezeEvidence {
  evidenceId: string;
  version: typeof TENDER_MARKETPLACE_VERSION;
  tag: typeof TENDER_MARKETPLACE_TAG;
  freezeManifest: {
    frozenDomains: string[];
    canonicalQuery: typeof CANONICAL_TENDER_PUBLISHING_QUERY;
    tenderCount: number;
    requirementCount: number;
    publishedCount: number;
  };
  coverage: TenderMarketplaceCoverageStats;
  readiness: TenderMarketplaceReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
