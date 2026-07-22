/**
 * Commercialization P4 — Onboarding registry
 */

import {
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
} from "./onboarding.constants";
import { getCustomerAccount } from "../account/account.registry";
import type {
  OnboardingPlan,
  OnboardingStatus,
  OnboardingStep,
  RegisterOnboardingInput,
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
  return {
    ...plan,
    completedSteps: [...plan.completedSteps],
    metadata: { ...plan.metadata },
  };
}

export function registerOnboarding(
  input: RegisterOnboardingInput,
): OnboardingPlan {
  const name = input.name.trim();
  const accountId = input.accountId.trim();
  if (!name) throw new Error("onboarding.name is required");

  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const id = input.id?.trim() || createId("onb");
  if (plans.has(id)) {
    throw new Error(`onboarding plan already exists: ${id}`);
  }

  const status: OnboardingStatus = "NOT_STARTED";
  const currentStep: OnboardingStep = "INTAKE";
  if (!(ONBOARDING_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid onboarding status: ${status}`);
  }
  if (!(ONBOARDING_STEPS as readonly string[]).includes(currentStep)) {
    throw new Error(`invalid onboarding step: ${currentStep}`);
  }

  const now = nowIso();
  const plan: OnboardingPlan = {
    id,
    accountId,
    name,
    status,
    currentStep,
    completedSteps: [],
    detail: `status=${status} step=${currentStep}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function updateOnboardingStep(
  id: string,
  step: OnboardingStep,
  completedSteps: OnboardingStep[],
  status: OnboardingStatus,
): OnboardingPlan {
  const plan = plans.get(id.trim());
  if (!plan) throw new Error(`onboarding plan not found: ${id}`);
  plan.currentStep = step;
  plan.completedSteps = [...completedSteps];
  plan.status = status;
  if (status === "COMPLETED") plan.completedAt = nowIso();
  plan.updatedAt = nowIso();
  plan.detail = `status=${status} step=${step}`;
  plans.set(plan.id, plan);
  return clonePlan(plan);
}

export function getOnboardingPlan(id: string): OnboardingPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listOnboardingPlans(filter?: {
  accountId?: string;
  status?: OnboardingStatus;
}): OnboardingPlan[] {
  let result = [...plans.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((p) => p.accountId === aid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearOnboardingPlans(): void {
  plans.clear();
}
