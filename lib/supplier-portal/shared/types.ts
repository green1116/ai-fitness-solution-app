import type { ServiceLevel } from "@/lib/regional-supplier-foundation/shared/types";

export const SUPPLIER_PORTAL_VERSION = "v27-supplier-portal-4" as const;
export const SUPPLIER_PORTAL_TAG = "v27-supplier-portal-foundation" as const;

export type SupplierPortalDataMode = "supplier-portal";

export type SupplierPortalStatus = "active" | "inactive" | "draft";

export type SupplierPortalCoverageLevel = "tier-1" | "tier-2" | "tier-3";

export interface SupplierProfile {
  supplierId: string;
  supplierName: string;
  city: string;
  region: string;
  contact: string;
  serviceLevel: ServiceLevel;
  status: SupplierPortalStatus;
  mode: SupplierPortalDataMode;
}

export interface InventoryProfile {
  inventoryId: string;
  sku: string;
  warehouse: string;
  quantity: number;
  safetyStock: number;
  status: SupplierPortalStatus;
  mode: SupplierPortalDataMode;
}

export interface PricingProfile {
  pricingId: string;
  sku: string;
  listPrice: number;
  dealerPrice: number;
  projectPrice: number;
  bulkPrice: number;
  currency: "CNY";
  status: SupplierPortalStatus;
  mode: SupplierPortalDataMode;
}

export interface ServiceProfile {
  serviceId: string;
  city: string;
  responseTime: string;
  onsiteTime: string;
  engineerCount: number;
  sparePartsAvailable: boolean;
  status: SupplierPortalStatus;
  mode: SupplierPortalDataMode;
}

export interface CoverageProfile {
  coverageId: string;
  city: string;
  coverageLevel: SupplierPortalCoverageLevel;
  leadTime: string;
  sla: string;
  status: SupplierPortalStatus;
  mode: SupplierPortalDataMode;
}

export interface SupplierPortalValidation {
  valid: boolean;
  supplierExists: boolean;
  inventoryExists: boolean;
  pricingExists: boolean;
  serviceExists: boolean;
  coverageExists: boolean;
  v21NetworkCompatible: boolean;
  v22ProcurementCompatible: boolean;
}

export interface SupplierPortalReport {
  version: typeof SUPPLIER_PORTAL_VERSION;
  reportId: string;
  supplierCount: number;
  inventoryCount: number;
  pricingCount: number;
  serviceCount: number;
  coverageCount: number;
  validation: SupplierPortalValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_SUPPLIER_PORTAL_QUERY = {
  supplierId: "supplier-life-fitness-cn",
} as const;

export type SupplierOnboardingStatus =
  | "draft"
  | "submitted"
  | "review"
  | "approved"
  | "published"
  | "rejected";

export const SUPPLIER_ONBOARDING_WORKFLOW_STATES = [
  "draft",
  "submitted",
  "review",
  "approved",
  "published",
] as const;

export interface SupplierOnboardingSubmission {
  submissionId: string;
  supplierProfile: SupplierProfile;
  inventoryProfiles: InventoryProfile[];
  pricingProfiles: PricingProfile[];
  serviceProfiles: ServiceProfile[];
  coverageProfiles: CoverageProfile[];
  submittedAt: string | null;
  status: SupplierOnboardingStatus;
  mode: SupplierPortalDataMode;
}

export interface SupplierOnboardingIntakeInput {
  supplierId: string;
}

export interface SupplierOnboardingSubmissionValidation {
  valid: boolean;
  supplierExists: boolean;
  inventoryExists: boolean;
  pricingExists: boolean;
  serviceExists: boolean;
  coverageExists: boolean;
}

export type SupplierOnboardingApprovalDecision = "approved" | "rejected";

export interface SupplierOnboardingApprovalGate {
  submissionId: string;
  decision: SupplierOnboardingApprovalDecision;
  reasons: string[];
  validatedAt: string;
}

export interface SupplierOnboardingWorkflowStep {
  status: SupplierOnboardingStatus;
  completed: boolean;
  current: boolean;
}

export interface SupplierOnboardingWorkflow {
  submissionId: string;
  currentStatus: SupplierOnboardingStatus;
  steps: SupplierOnboardingWorkflowStep[];
  nextStatus: SupplierOnboardingStatus | null;
}

export interface SupplierOnboardingReport {
  version: typeof SUPPLIER_PORTAL_VERSION;
  reportId: string;
  submissionCount: number;
  approvedCount: number;
  rejectedCount: number;
  publishedCount: number;
  validation: SupplierOnboardingSubmissionValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_SUPPLIER_ONBOARDING_QUERY = {
  supplierId: "supplier-life-fitness-cn",
  submissionId: "onboarding-life-fitness-cn-001",
} as const;

export interface SupplierPortalCoverageStats {
  supplierProfileCoverage: number;
  inventoryProfileCoverage: number;
  pricingProfileCoverage: number;
  serviceProfileCoverage: number;
  coverageProfileCoverage: number;
  onboardingCoverage: number;
  approvalWorkflowCoverage: number;
  coverageScore: number;
}

export interface SupplierPortalFreezeValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  workflowPathValid: boolean;
  validationScore: number;
}

export interface SupplierPortalReadiness {
  readinessScore: number;
  validationScore: number;
  coverageScore: number;
  supplierCount: number;
  inventoryCount: number;
  pricingCount: number;
  serviceCount: number;
  coverageCount: number;
  submissionCount: number;
  approvalCount: number;
  publishedCount: number;
}

export interface SupplierPortalWorkflowPathResult {
  supplierId: string;
  supplierName: string;
  finalStatus: SupplierOnboardingStatus;
  approvalDecision: SupplierOnboardingApprovalDecision;
  pathValid: boolean;
}

export interface SupplierPortalFreezeReport {
  version: typeof SUPPLIER_PORTAL_VERSION;
  tag: typeof SUPPLIER_PORTAL_TAG;
  reportId: string;
  status: "frozen";
  coverage: SupplierPortalCoverageStats;
  validation: SupplierPortalFreezeValidation;
  readiness: SupplierPortalReadiness;
  workflowPaths: SupplierPortalWorkflowPathResult[];
  exampleOnboardingReport: SupplierOnboardingReport | null;
  moduleStatistics: {
    frozenDomains: number;
    profileCatalogs: number;
    workflowStates: number;
    validationGates: number;
    reportBuilders: number;
  };
  canonicalQuery: typeof CANONICAL_SUPPLIER_ONBOARDING_QUERY;
  summary: string;
  generatedAt: string;
}

export interface SupplierPortalFreezeEvidence {
  evidenceId: string;
  version: typeof SUPPLIER_PORTAL_VERSION;
  tag: typeof SUPPLIER_PORTAL_TAG;
  freezeManifest: {
    frozenDomains: string[];
    canonicalQuery: typeof CANONICAL_SUPPLIER_ONBOARDING_QUERY;
    supplierCount: number;
    inventoryCount: number;
    publishedCount: number;
  };
  coverage: SupplierPortalCoverageStats;
  readiness: SupplierPortalReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
