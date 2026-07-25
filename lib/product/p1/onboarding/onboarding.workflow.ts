/**
 * Product P1 — Onboarding workflow
 */

import { ONBOARDING_STEPS } from "./onboarding.constants";
import {
  getOnboardingPlan,
  updateOnboardingStep,
} from "./onboarding.registry";
import type {
  AdvanceOnboardingInput,
  OnboardingStep,
  OnboardingWorkflowEvent,
} from "./onboarding.types";

const events = new Map<string, OnboardingWorkflowEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: OnboardingWorkflowEvent): OnboardingWorkflowEvent {
  return { ...event };
}

function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function advanceOnboardingWorkflow(
  input: AdvanceOnboardingInput,
): OnboardingWorkflowEvent {
  const onboardingId = input.onboardingId.trim();
  const plan = getOnboardingPlan(onboardingId);
  if (!plan) throw new Error(`onboarding plan not found: ${onboardingId}`);
  if (plan.status === "CANCELLED" || plan.status === "COMPLETED") {
    throw new Error(`cannot advance ${plan.status} onboarding`);
  }
  if (!(ONBOARDING_STEPS as readonly string[]).includes(input.step)) {
    throw new Error(`invalid onboarding step: ${input.step}`);
  }

  const previousStep = plan.currentStep;
  const completed = new Set(plan.completedSteps);
  if (previousStep !== input.step) completed.add(previousStep);
  completed.add(input.step);

  const completedSteps = ONBOARDING_STEPS.filter((s) => completed.has(s));
  const isDone =
    input.step === "GO_LIVE" &&
    completedSteps.length === ONBOARDING_STEPS.length;
  const status = isDone
    ? "COMPLETED"
    : stepIndex(input.step) > stepIndex(previousStep) ||
        completedSteps.length > 0
      ? "IN_PROGRESS"
      : plan.status === "NOT_STARTED"
        ? "IN_PROGRESS"
        : plan.status;

  updateOnboardingStep(onboardingId, input.step, completedSteps, status);

  const id = input.id?.trim() || createId("p1wf");
  if (events.has(id)) {
    throw new Error(`onboarding workflow event already exists: ${id}`);
  }

  const event: OnboardingWorkflowEvent = {
    id,
    onboardingId,
    step: input.step,
    previousStep,
    note: (input.note ?? `advanced ${previousStep}→${input.step}`).trim(),
    advancedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getOnboardingWorkflowEvent(
  id: string,
): OnboardingWorkflowEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listOnboardingWorkflowEvents(filter?: {
  onboardingId?: string;
}): OnboardingWorkflowEvent[] {
  let result = [...events.values()];
  if (filter?.onboardingId) {
    const oid = filter.onboardingId.trim();
    result = result.filter((e) => e.onboardingId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearOnboardingWorkflowEvents(): void {
  events.clear();
}
