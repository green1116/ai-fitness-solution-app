/**
 * Post-Launch P2 — Customer Success Operations types
 */

import type {
  ADOPTION_STAGES,
  CUSTOMER_HEALTH_LEVELS,
  CUSTOMER_SUCCESS_MANAGER_STATUSES,
  CUSTOMER_SUCCESS_READINESS_VERDICTS,
  OPERATIONS_CUSTOMER_SUCCESS_BASE,
  OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_ID,
  OPERATIONS_CUSTOMER_SUCCESS_VERSION,
  SUCCESS_STEP_STATUSES,
  SUCCESS_WORKFLOW_STEPS,
} from "./success.constants";

export type CustomerHealthLevel = (typeof CUSTOMER_HEALTH_LEVELS)[number];
export type AdoptionStage = (typeof ADOPTION_STAGES)[number];
export type SuccessWorkflowStep = (typeof SUCCESS_WORKFLOW_STEPS)[number];
export type SuccessStepStatus = (typeof SUCCESS_STEP_STATUSES)[number];
export type CustomerSuccessReadinessVerdict =
  (typeof CUSTOMER_SUCCESS_READINESS_VERDICTS)[number];
export type CustomerSuccessManagerStatus =
  (typeof CUSTOMER_SUCCESS_MANAGER_STATUSES)[number];

export type SuccessMetadata = Record<string, unknown>;

/** Customer health model. */
export type CustomerHealthProfile = {
  id: string;
  name: string;
  productId: string;
  organizationId: string;
  productTenantId: string;
  productionOperationId?: string;
  supportSlaProfileId?: string;
  onboardingProfileId?: string;
  health: CustomerHealthLevel;
  score: number;
  detail: string;
  metadata: SuccessMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerHealthProfileInput = {
  id?: string;
  name: string;
  productId: string;
  organizationId: string;
  productTenantId: string;
  productionOperationId?: string;
  supportSlaProfileId?: string;
  onboardingProfileId?: string;
  metadata?: SuccessMetadata;
};

/** Adoption tracking. */
export type AdoptionRecord = {
  id: string;
  customerHealthProfileId: string;
  stage: AdoptionStage;
  featureCount: number;
  activeUsers: number;
  detail: string;
  recordedAt: string;
};

export type RecordAdoptionInput = {
  id?: string;
  customerHealthProfileId: string;
  stage: AdoptionStage;
  featureCount: number;
  activeUsers: number;
  detail?: string;
};

/** Success workflow. */
export type SuccessStepRecord = {
  step: SuccessWorkflowStep;
  status: SuccessStepStatus;
  detail: string;
  completedAt?: string;
};

export type SuccessWorkflow = {
  id: string;
  customerHealthProfileId: string;
  steps: SuccessStepRecord[];
  currentStep?: SuccessWorkflowStep;
  complete: boolean;
  failed: boolean;
  updatedAt: string;
};

export type StartSuccessWorkflowInput = {
  id?: string;
  customerHealthProfileId: string;
  targetLifecycleStage?: "ONBOARDING" | "ACTIVE" | "AT_RISK";
};

/** Lifecycle operations (commercial lifecycle bridge). */
export type LifecycleOperation = {
  id: string;
  customerHealthProfileId: string;
  commercialLifecycleId: string;
  stage: string;
  previousStage?: string;
  detail: string;
  operatedAt: string;
};

export type RunLifecycleOperationInput = {
  id?: string;
  customerHealthProfileId: string;
  stage: "PROSPECT" | "ONBOARDING" | "ACTIVE" | "AT_RISK" | "CHURNED";
  reason?: string;
};

/** Engagement metrics. */
export type EngagementMetrics = {
  customerHealthProfileId: string;
  health: CustomerHealthLevel;
  healthScore: number;
  adoptionStage?: AdoptionStage;
  activeUsers: number;
  featureCount: number;
  workflowComplete: boolean;
  lifecycleStage?: string;
  slaActive: boolean;
  engagementScore: number;
  computedAt: string;
};

/** Readiness. */
export type CustomerSuccessReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CustomerSuccessReadinessResult = {
  customerHealthProfileId: string;
  verdict: CustomerSuccessReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CustomerSuccessReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type CustomerSuccessRegistryManifest = {
  customerSuccessId: typeof OPERATIONS_CUSTOMER_SUCCESS_ID;
  version: typeof OPERATIONS_CUSTOMER_SUCCESS_VERSION;
  freezeVersion: typeof OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION;
  base: typeof OPERATIONS_CUSTOMER_SUCCESS_BASE;
  healthProfileCount: number;
  adoptionCount: number;
  workflowCount: number;
  lifecycleOperationCount: number;
};
