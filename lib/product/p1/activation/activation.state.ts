/**
 * Product P1 — Activation state
 */

import { ACTIVATION_STATES } from "../onboarding/onboarding.constants";
import { getOnboardingPlan } from "../onboarding/onboarding.registry";
import type {
  ActivationRecord,
  ActivationState,
  SetActivationStateInput,
} from "../onboarding/onboarding.types";

const activations = new Map<string, ActivationRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneActivation(record: ActivationRecord): ActivationRecord {
  return { ...record };
}

export function setActivationState(
  input: SetActivationStateInput,
): ActivationRecord {
  const onboardingId = input.onboardingId.trim();
  if (!onboardingId) throw new Error("activation.onboardingId is required");
  if (!(ACTIVATION_STATES as readonly string[]).includes(input.state)) {
    throw new Error(`invalid activation state: ${input.state}`);
  }
  if (!getOnboardingPlan(onboardingId)) {
    throw new Error(`onboarding plan not found: ${onboardingId}`);
  }

  const existing = [...activations.values()].find(
    (a) => a.onboardingId === onboardingId,
  );
  const id = input.id?.trim() || existing?.id || createId("p1act");
  if (!existing && activations.has(id)) {
    throw new Error(`activation already exists: ${id}`);
  }

  const record: ActivationRecord = {
    id,
    onboardingId,
    state: input.state,
    detail: (input.detail ?? `state=${input.state}`).trim(),
    updatedAt: nowIso(),
  };
  activations.set(id, record);
  return cloneActivation(record);
}

export function getActivation(id: string): ActivationRecord | undefined {
  const record = activations.get(id.trim());
  return record ? cloneActivation(record) : undefined;
}

export function listActivations(filter?: {
  onboardingId?: string;
  state?: ActivationState;
}): ActivationRecord[] {
  let result = [...activations.values()];
  if (filter?.onboardingId) {
    const oid = filter.onboardingId.trim();
    result = result.filter((a) => a.onboardingId === oid);
  }
  if (filter?.state) {
    result = result.filter((a) => a.state === filter.state);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneActivation);
}

export function clearActivations(): void {
  activations.clear();
}
