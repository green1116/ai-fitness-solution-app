import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

export const BRAND_PORTAL_VERSION = "v26-brand-portal-4" as const;
export const BRAND_PORTAL_TAG = "v26-brand-portal-foundation" as const;

export type BrandPortalDataMode = "brand-portal";

export type BrandPortalStatus = "active" | "inactive" | "draft";

export type BrandPortalCategory =
  | "premium"
  | "commercial"
  | "mid-market"
  | "domestic"
  | "value";

export interface BrandProfile {
  brandId: string;
  brandName: string;
  country: string;
  category: BrandPortalCategory;
  website: string;
  description: string;
  status: BrandPortalStatus;
  mode: BrandPortalDataMode;
}

export interface ProductProfile {
  sku: string;
  brandId: string;
  name: string;
  category: string;
  specification: string;
  documentRefs: string[];
  status: BrandPortalStatus;
  mode: BrandPortalDataMode;
}

export interface CertificationProfile {
  brandId: string;
  certificateType: string;
  issuer: string;
  validUntil: string;
  documentRef: string;
  mode: BrandPortalDataMode;
}

export interface CaseStudyProfile {
  brandId: string;
  projectName: string;
  city: string;
  industry: ProjectType;
  year: number;
  summary: string;
  documentRef: string;
  mode: BrandPortalDataMode;
}

export interface BrandPortalValidation {
  valid: boolean;
  brandExists: boolean;
  productExists: boolean;
  certificationExists: boolean;
  caseStudyExists: boolean;
  v20CatalogCompatible: boolean;
}

export interface BrandPortalReport {
  version: typeof BRAND_PORTAL_VERSION;
  reportId: string;
  brandCount: number;
  productCount: number;
  certificationCount: number;
  caseStudyCount: number;
  validation: BrandPortalValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_BRAND_PORTAL_QUERY = {
  brandId: "brand-life-fitness",
} as const;

export type BrandOnboardingStatus =
  | "draft"
  | "submitted"
  | "review"
  | "approved"
  | "published"
  | "rejected";

export const BRAND_ONBOARDING_WORKFLOW_STATES = [
  "draft",
  "submitted",
  "review",
  "approved",
  "published",
] as const;

export interface BrandOnboardingSubmission {
  submissionId: string;
  brandProfile: BrandProfile;
  products: ProductProfile[];
  certifications: CertificationProfile[];
  caseStudies: CaseStudyProfile[];
  submittedAt: string | null;
  status: BrandOnboardingStatus;
  mode: BrandPortalDataMode;
}

export interface BrandOnboardingIntakeInput {
  brandId: string;
}

export interface BrandOnboardingSubmissionValidation {
  valid: boolean;
  brandExists: boolean;
  productsExist: boolean;
  certificationsExist: boolean;
  caseStudiesExist: boolean;
}

export type BrandOnboardingApprovalDecision = "approved" | "rejected";

export interface BrandOnboardingApprovalGate {
  submissionId: string;
  decision: BrandOnboardingApprovalDecision;
  reasons: string[];
  validatedAt: string;
}

export interface BrandOnboardingWorkflowStep {
  status: BrandOnboardingStatus;
  completed: boolean;
  current: boolean;
}

export interface BrandOnboardingWorkflow {
  submissionId: string;
  currentStatus: BrandOnboardingStatus;
  steps: BrandOnboardingWorkflowStep[];
  nextStatus: BrandOnboardingStatus | null;
}

export interface BrandOnboardingReport {
  version: typeof BRAND_PORTAL_VERSION;
  reportId: string;
  submissionCount: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  validation: BrandOnboardingSubmissionValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_BRAND_ONBOARDING_QUERY = {
  brandId: "brand-life-fitness",
  submissionId: "onboarding-life-fitness-001",
} as const;

export interface BrandPortalCoverageStats {
  brandProfileCoverage: number;
  productProfileCoverage: number;
  certificationCoverage: number;
  caseStudyCoverage: number;
  onboardingCoverage: number;
  approvalWorkflowCoverage: number;
  coverageScore: number;
}

export interface BrandPortalFreezeValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  workflowPathValid: boolean;
  validationScore: number;
}

export interface BrandPortalReadiness {
  readinessScore: number;
  validationScore: number;
  coverageScore: number;
  brandCount: number;
  productCount: number;
  submissionCount: number;
  publishedCount: number;
}

export interface BrandPortalWorkflowPathResult {
  brandId: string;
  brandName: string;
  finalStatus: BrandOnboardingStatus;
  approvalDecision: BrandOnboardingApprovalDecision;
  pathValid: boolean;
}

export interface BrandPortalFreezeReport {
  version: typeof BRAND_PORTAL_VERSION;
  tag: typeof BRAND_PORTAL_TAG;
  reportId: string;
  status: "frozen";
  coverage: BrandPortalCoverageStats;
  validation: BrandPortalFreezeValidation;
  readiness: BrandPortalReadiness;
  workflowPaths: BrandPortalWorkflowPathResult[];
  exampleOnboardingReport: BrandOnboardingReport | null;
  moduleStatistics: {
    frozenDomains: number;
    profileCatalogs: number;
    workflowStates: number;
    validationGates: number;
    reportBuilders: number;
  };
  canonicalQuery: typeof CANONICAL_BRAND_ONBOARDING_QUERY;
  summary: string;
  generatedAt: string;
}

export interface BrandPortalFreezeEvidence {
  evidenceId: string;
  version: typeof BRAND_PORTAL_VERSION;
  tag: typeof BRAND_PORTAL_TAG;
  freezeManifest: {
    frozenDomains: string[];
    canonicalQuery: typeof CANONICAL_BRAND_ONBOARDING_QUERY;
    brandCount: number;
    productCount: number;
    publishedCount: number;
  };
  coverage: BrandPortalCoverageStats;
  readiness: BrandPortalReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
