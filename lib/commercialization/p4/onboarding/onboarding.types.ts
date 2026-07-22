/**
 * Commercialization P4 — Onboarding types
 */

import type {
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
} from "./onboarding.constants";

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type OnboardingMetadata = Record<string, unknown>;

export type OnboardingPlan = {
  id: string;
  accountId: string;
  name: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  detail: string;
  metadata: OnboardingMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type RegisterOnboardingInput = {
  id?: string;
  accountId: string;
  name: string;
  metadata?: OnboardingMetadata;
};

export type OnboardingWorkflowEvent = {
  id: string;
  onboardingId: string;
  step: OnboardingStep;
  previousStep?: OnboardingStep;
  note: string;
  advancedAt: string;
};

export type AdvanceOnboardingInput = {
  id?: string;
  onboardingId: string;
  step: OnboardingStep;
  note?: string;
};
