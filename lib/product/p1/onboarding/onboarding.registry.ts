/**
 * Product P1 — Onboarding registry
 */

import { getCustomerProfile } from "../customer/customer.profile";
import {
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
} from "./onboarding.constants";
import type {
  OnboardingPlan,
  OnboardingStatus,
  OnboardingStep,
  RegisterOnboardingPlanInput,
} from "./onboarding.types";

const plans = new Map<string, OnboardingPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: OnboardingPlan): OnboardingPlan {
  return { ...plan, completedSteps: [...plan.completedSteps] };
}

export function registerOnboardingPlan(
  input: RegisterOnboardingPlanInput,
): OnboardingPlan {
  const profileId = input.profileId.trim();
  if (!profileId) throw new Error("onboarding.profileId is required");
  if (!getCustomerProfile(profileId)) {
    throw new Error(`customer profile not found: ${profileId}`);
  }

  const id = input.id?.trim() || createId("p1onb");
  if (plans.has(id)) {
    throw new Error(`onboarding plan already exists: ${id}`);
  }

  const now = nowIso();
  const status = ONBOARDING_STATUSES[0];
  const currentStep = ONBOARDING_STEPS[0];
  const plan: OnboardingPlan = {
    id,
    profileId,
    status,
    currentStep,
    completedSteps: [],
    detail: `status=${status} step=${currentStep}`,
    createdAt: now,
    updatedAt: now,
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getOnboardingPlan(id: string): OnboardingPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listOnboardingPlans(filter?: {
  profileId?: string;
  status?: OnboardingStatus;
}): OnboardingPlan[] {
  let result = [...plans.values()];
  if (filter?.profileId) {
    const pid = filter.profileId.trim();
    result = result.filter((p) => p.profileId === pid);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function updateOnboardingStep(
  onboardingId: string,
  step: OnboardingStep,
  completedSteps: OnboardingStep[],
  status: OnboardingStatus,
): OnboardingPlan {
  const existing = plans.get(onboardingId.trim());
  if (!existing) {
    throw new Error(`onboarding plan not found: ${onboardingId}`);
  }
  const updated: OnboardingPlan = {
    ...existing,
    currentStep: step,
    completedSteps: [...completedSteps],
    status,
    detail: `status=${status} step=${step}`,
    updatedAt: nowIso(),
  };
  plans.set(onboardingId.trim(), updated);
  return clonePlan(updated);
}

export function clearOnboardingPlans(): void {
  plans.clear();
}
