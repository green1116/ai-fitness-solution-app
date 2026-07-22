/**
 * Commercialization P4 — Delivery handoff types + shared readiness types
 */

import type {
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
  HANDOFF_STATUSES,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_READINESS_VERDICTS,
} from "../onboarding/onboarding.constants";

export type HandoffStatus = (typeof HANDOFF_STATUSES)[number];
export type OnboardingReadinessVerdict =
  (typeof ONBOARDING_READINESS_VERDICTS)[number];
export type OnboardingManagerStatus =
  (typeof ONBOARDING_MANAGER_STATUSES)[number];

export type DeliveryHandoff = {
  id: string;
  accountId: string;
  onboardingId: string;
  workspaceId: string;
  status: HandoffStatus;
  recipient: string;
  notes: string;
  detail: string;
  handedOffAt: string;
};

export type CreateHandoffInput = {
  id?: string;
  accountId: string;
  onboardingId: string;
  workspaceId: string;
  recipient?: string;
  notes?: string;
};

export type OnboardingReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OnboardingReadinessResult = {
  verdict: OnboardingReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OnboardingReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OnboardingRegistryManifest = {
  foundationId: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID;
  version: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE;
  accountCount: number;
  onboardingCount: number;
  workflowCount: number;
  workspaceCount: number;
  setupCount: number;
  profileCount: number;
  requirementCount: number;
  intakeCount: number;
  handoffCount: number;
};
