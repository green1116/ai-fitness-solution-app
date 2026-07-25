/**
 * Product P1 — Onboarding types + readiness / manifest
 */

import type {
  ACTIVATION_STATES,
  CHECKLIST_ITEM_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  P1_MANAGER_STATUSES,
  P1_READINESS_VERDICTS,
  PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
  PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
  WORKSPACE_STATUSES,
} from "./onboarding.constants";

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type IntakeChannel = (typeof INTAKE_CHANNELS)[number];
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];
export type ChecklistItemStatus = (typeof CHECKLIST_ITEM_STATUSES)[number];
export type ActivationState = (typeof ACTIVATION_STATES)[number];
export type P1ReadinessVerdict = (typeof P1_READINESS_VERDICTS)[number];
export type P1ManagerStatus = (typeof P1_MANAGER_STATUSES)[number];
export type OnboardingMetadata = Record<string, unknown>;

export type CustomerProfile = {
  id: string;
  accountRef: string;
  name: string;
  owner: string;
  detail: string;
  metadata: OnboardingMetadata;
  createdAt: string;
};

export type CreateCustomerProfileInput = {
  id?: string;
  accountRef: string;
  name: string;
  owner: string;
  metadata?: OnboardingMetadata;
};

export type CustomerIntake = {
  id: string;
  profileId: string;
  channel: IntakeChannel;
  summary: string;
  detail: string;
  recordedAt: string;
};

export type RecordCustomerIntakeInput = {
  id?: string;
  profileId: string;
  channel: IntakeChannel;
  summary: string;
};

export type OnboardingPlan = {
  id: string;
  profileId: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOnboardingPlanInput = {
  id?: string;
  profileId: string;
};

export type OnboardingWorkflowEvent = {
  id: string;
  onboardingId: string;
  step: OnboardingStep;
  previousStep: OnboardingStep;
  note: string;
  advancedAt: string;
};

export type AdvanceOnboardingInput = {
  id?: string;
  onboardingId: string;
  step: OnboardingStep;
  note?: string;
};

export type WorkspaceSetup = {
  id: string;
  onboardingId: string;
  name: string;
  status: WorkspaceStatus;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type SetupWorkspaceInput = {
  id?: string;
  onboardingId: string;
  name: string;
};

export type ChecklistItem = {
  key: string;
  label: string;
  required: boolean;
  status: ChecklistItemStatus;
};

export type OnboardingChecklist = {
  id: string;
  onboardingId: string;
  items: ChecklistItem[];
  detail: string;
  updatedAt: string;
};

export type CreateChecklistInput = {
  id?: string;
  onboardingId: string;
};

export type MarkChecklistItemInput = {
  checklistId: string;
  key: string;
  status: ChecklistItemStatus;
};

export type ActivationRecord = {
  id: string;
  onboardingId: string;
  state: ActivationState;
  detail: string;
  updatedAt: string;
};

export type SetActivationStateInput = {
  id?: string;
  onboardingId: string;
  state: ActivationState;
  detail?: string;
};

export type P1ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P1ReadinessResult = {
  verdict: P1ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P1ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P1RegistryManifest = {
  foundationId: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_ID;
  version: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION;
  freezeVersion: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION;
  base: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_BASE;
  profileCount: number;
  intakeCount: number;
  planCount: number;
  workflowCount: number;
  workspaceCount: number;
  checklistCount: number;
  activationCount: number;
};
