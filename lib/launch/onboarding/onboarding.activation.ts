/**
 * Launch P2 — Activation State
 */

import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { ACTIVATION_STATES } from "./onboarding.constants";
import {
  getOnboardingProfile,
  updateOnboardingProfile,
} from "./onboarding.profile";
import type {
  ActivationState,
  CustomerActivation,
  SetActivationStateInput,
} from "./onboarding.types";

const activations = new Map<string, CustomerActivation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneActivation(activation: CustomerActivation): CustomerActivation {
  return { ...activation, metadata: { ...activation.metadata } };
}

export function getOrCreateCustomerActivation(
  onboardingProfileId: string,
): CustomerActivation {
  const existing = activations.get(onboardingProfileId.trim());
  if (existing) return cloneActivation(existing);

  const profile = getOnboardingProfile(onboardingProfileId);
  if (!profile) {
    throw new Error(`onboarding profile not found: ${onboardingProfileId}`);
  }

  const activation: CustomerActivation = {
    id: createId("activation"),
    onboardingProfileId: profile.id,
    productTenantId: profile.productTenantId,
    state: "INACTIVE",
    detail: "awaiting activation",
    metadata: {},
  };
  activations.set(profile.id, activation);
  return cloneActivation(activation);
}

export function setActivationState(
  input: SetActivationStateInput,
): CustomerActivation {
  const onboardingProfileId = input.onboardingProfileId.trim();
  const state = input.state;
  if (!(ACTIVATION_STATES as readonly string[]).includes(state)) {
    throw new Error(`invalid activation state: ${state}`);
  }

  const profile = getOnboardingProfile(onboardingProfileId);
  if (!profile) {
    throw new Error(`onboarding profile not found: ${onboardingProfileId}`);
  }

  const activation =
    activations.get(onboardingProfileId) ??
    getOrCreateCustomerActivation(onboardingProfileId);

  if (state === "ACTIVE") {
    if (!profile.productTenantId) {
      throw new Error("product tenant required for ACTIVE activation");
    }
    const tenant = getProductTenant(profile.productTenantId);
    if (!tenant || tenant.status !== "ACTIVE") {
      throw new Error(`product tenant not ACTIVE: ${profile.productTenantId}`);
    }
  }

  const updated: CustomerActivation = {
    ...activation,
    productTenantId: profile.productTenantId,
    state,
    detail: input.detail?.trim() || `state=${state}`,
    metadata: { ...activation.metadata, ...(input.metadata ?? {}) },
    activatedAt: state === "ACTIVE" ? nowIso() : activation.activatedAt,
  };
  activations.set(onboardingProfileId, updated);

  if (state === "ACTIVE") {
    updateOnboardingProfile(onboardingProfileId, { status: "ACTIVATED" });
  } else if (state === "PENDING_ACTIVATION") {
    updateOnboardingProfile(onboardingProfileId, { status: "READY" });
  }

  return cloneActivation(updated);
}

export function getCustomerActivation(
  onboardingProfileId: string,
): CustomerActivation | undefined {
  const activation = activations.get(onboardingProfileId.trim());
  return activation ? cloneActivation(activation) : undefined;
}

export function listCustomerActivations(filter?: {
  state?: ActivationState;
}): CustomerActivation[] {
  let result = [...activations.values()];
  if (filter?.state) result = result.filter((a) => a.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneActivation);
}

export function clearCustomerActivations(): void {
  activations.clear();
}
