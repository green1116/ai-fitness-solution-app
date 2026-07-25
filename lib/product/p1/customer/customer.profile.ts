/**
 * Product P1 — Customer profile
 */

import type {
  CreateCustomerProfileInput,
  CustomerProfile,
} from "../onboarding/onboarding.types";

const profiles = new Map<string, CustomerProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: CustomerProfile): CustomerProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createCustomerProfile(
  input: CreateCustomerProfileInput,
): CustomerProfile {
  const accountRef = input.accountRef.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!accountRef) throw new Error("profile.accountRef is required");
  if (!name) throw new Error("profile.name is required");
  if (!owner) throw new Error("profile.owner is required");

  const id = input.id?.trim() || createId("p1prof");
  if (profiles.has(id)) {
    throw new Error(`customer profile already exists: ${id}`);
  }

  const profile: CustomerProfile = {
    id,
    accountRef,
    name,
    owner,
    detail: `account=${accountRef} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getCustomerProfile(id: string): CustomerProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listCustomerProfiles(filter?: {
  accountRef?: string;
}): CustomerProfile[] {
  let result = [...profiles.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((p) => p.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearCustomerProfiles(): void {
  profiles.clear();
}
