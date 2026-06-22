/**
 * V60 P1 — Onboarding flow (Visitor → Activation → First Value)
 */

import {
  ONBOARDING_STEPS,
  resolveNextOnboardingStep,
  isOnboardingComplete,
  type OnboardingState,
  type OnboardingStep,
} from "../funnel/growth.funnel.model";
import { getOnboardingState, saveOnboardingState } from "../growth.events.store";
import { trackActivation } from "../analytics.events";

export { ONBOARDING_STEPS, type OnboardingStep, type OnboardingState };

export function createOnboardingState(userId: string): OnboardingState {
  return {
    userId,
    completedSteps: ["create_account"],
    currentStep: "create_organization",
    activated: false,
  };
}

export function getOnboardingFlow(): readonly OnboardingStep[] {
  return ONBOARDING_STEPS;
}

export function advanceOnboardingStep(
  userId: string,
  step: OnboardingStep,
  organizationId?: string,
): OnboardingState {
  const existing = getOnboardingState(userId) ?? createOnboardingState(userId);
  const completed = existing.completedSteps.includes(step)
    ? existing.completedSteps
    : [...existing.completedSteps, step];

  const activated =
    step === "generate_first_quote" ||
    completed.includes("generate_first_quote") ||
    existing.activated;

  const state: OnboardingState = {
    userId,
    organizationId: organizationId ?? existing.organizationId,
    completedSteps: completed,
    currentStep: resolveNextOnboardingStep(completed),
    activated,
  };

  if (step === "create_organization" && state.organizationId) {
    trackActivation({ userId, organizationId: state.organizationId });
  }

  saveOnboardingState(state);
  return state;
}

export function resolveOnboardingProgress(userId: string): OnboardingState {
  return getOnboardingState(userId) ?? createOnboardingState(userId);
}

export function getOnboardingCompletionRate(states: OnboardingState[]): number {
  if (states.length === 0) return 0;
  const complete = states.filter((s) => isOnboardingComplete(s.completedSteps)).length;
  return Math.round((complete / states.length) * 100);
}
