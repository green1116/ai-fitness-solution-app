/**
 * Launch P2 — Customer Onboarding types
 */

import type {
  ACTIVATION_STATES,
  CUSTOMER_READINESS_VERDICTS,
  LAUNCH_CUSTOMER_ONBOARDING_BASE,
  LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_ID,
  LAUNCH_CUSTOMER_ONBOARDING_VERSION,
  ONBOARDING_CHECKLIST_ITEM_STATUSES,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_PROFILE_STATUSES,
  PROVISIONING_STEP_STATUSES,
  PROVISIONING_STEPS,
} from "./onboarding.constants";

export type OnboardingProfileStatus =
  (typeof ONBOARDING_PROFILE_STATUSES)[number];
export type ProvisioningStepStatus =
  (typeof PROVISIONING_STEP_STATUSES)[number];
export type ProvisioningStep = (typeof PROVISIONING_STEPS)[number];
export type OnboardingChecklistItemStatus =
  (typeof ONBOARDING_CHECKLIST_ITEM_STATUSES)[number];
export type ActivationState = (typeof ACTIVATION_STATES)[number];
export type CustomerReadinessVerdict =
  (typeof CUSTOMER_READINESS_VERDICTS)[number];
export type OnboardingManagerStatus =
  (typeof ONBOARDING_MANAGER_STATUSES)[number];

export type OnboardingMetadata = Record<string, unknown>;

/** Onboarding profile. */
export type OnboardingProfile = {
  id: string;
  customerName: string;
  productId: string;
  productionProfileId: string;
  organizationId?: string;
  workspaceId?: string;
  productTenantId?: string;
  deploymentPackageId?: string;
  status: OnboardingProfileStatus;
  metadata: OnboardingMetadata;
  createdAt: string;
};

export type CreateOnboardingProfileInput = {
  id?: string;
  customerName: string;
  productId: string;
  productionProfileId: string;
  organizationId?: string;
  deploymentPackageId?: string;
  status?: OnboardingProfileStatus;
  metadata?: OnboardingMetadata;
};

/** Tenant provisioning workflow. */
export type ProvisioningStepRecord = {
  step: ProvisioningStep;
  status: ProvisioningStepStatus;
  detail: string;
  completedAt?: string;
};

export type TenantProvisioningWorkflow = {
  id: string;
  onboardingProfileId: string;
  steps: ProvisioningStepRecord[];
  currentStep?: ProvisioningStep;
  complete: boolean;
  failed: boolean;
  updatedAt: string;
};

export type StartProvisioningInput = {
  id?: string;
  onboardingProfileId: string;
  workspaceName?: string;
  workspaceSlug?: string;
  tenantName?: string;
  organizationSlug?: string;
  editionId: string;
  packageId?: string;
};

/** Customer configuration. */
export type CustomerConfiguration = {
  id: string;
  onboardingProfileId: string;
  key: string;
  value: unknown;
  metadata: OnboardingMetadata;
  updatedAt: string;
};

export type SetCustomerConfigurationInput = {
  id?: string;
  onboardingProfileId: string;
  key: string;
  value: unknown;
  metadata?: OnboardingMetadata;
};

/** Onboarding checklist. */
export type OnboardingChecklistItem = {
  id: string;
  key: string;
  label: string;
  status: OnboardingChecklistItemStatus;
  required: boolean;
  detail: string;
};

export type OnboardingChecklist = {
  id: string;
  onboardingProfileId: string;
  items: OnboardingChecklistItem[];
  passCount: number;
  failCount: number;
  pendingCount: number;
  complete: boolean;
  updatedAt: string;
};

export type SetOnboardingChecklistItemInput = {
  checklistId: string;
  itemKey: string;
  status: OnboardingChecklistItemStatus;
  detail?: string;
};

/** Activation state. */
export type CustomerActivation = {
  id: string;
  onboardingProfileId: string;
  productTenantId?: string;
  state: ActivationState;
  activatedAt?: string;
  detail: string;
  metadata: OnboardingMetadata;
};

export type SetActivationStateInput = {
  onboardingProfileId: string;
  state: ActivationState;
  detail?: string;
  metadata?: OnboardingMetadata;
};

/** Customer readiness model. */
export type CustomerReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CustomerReadinessResult = {
  onboardingProfileId: string;
  verdict: CustomerReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CustomerReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OnboardingRegistryManifest = {
  onboardingId: typeof LAUNCH_CUSTOMER_ONBOARDING_ID;
  version: typeof LAUNCH_CUSTOMER_ONBOARDING_VERSION;
  freezeVersion: typeof LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION;
  base: typeof LAUNCH_CUSTOMER_ONBOARDING_BASE;
  profileCount: number;
  workflowCount: number;
  checklistCount: number;
  activationCount: number;
};
