/**
 * Commercialization P6 — Customer value
 */

import type {
  CaptureCustomerValueInput,
  CustomerValueProfile,
} from "./customer.types";

const values = new Map<string, CustomerValueProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValue(profile: CustomerValueProfile): CustomerValueProfile {
  return { ...profile };
}

export function captureCustomerValue(
  input: CaptureCustomerValueInput,
): CustomerValueProfile {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("customerValue.accountRef is required");
  if (!Number.isFinite(input.lifetimeValue) || input.lifetimeValue < 0) {
    throw new Error("lifetimeValue must be a non-negative number");
  }

  const expansionPotential = Math.max(
    0,
    Math.round(input.expansionPotential ?? input.lifetimeValue * 0.2),
  );
  const id = input.id?.trim() || createId("cval");
  if (values.has(id)) {
    throw new Error(`customer value profile already exists: ${id}`);
  }

  const profile: CustomerValueProfile = {
    id,
    accountRef,
    lifetimeValue: Math.round(input.lifetimeValue),
    expansionPotential,
    currency: (input.currency ?? "USD").trim().toUpperCase() || "USD",
    detail: `ltv=${Math.round(input.lifetimeValue)} expansion=${expansionPotential}`,
    createdAt: nowIso(),
  };
  values.set(id, profile);
  return cloneValue(profile);
}

export function getCustomerValueProfile(
  id: string,
): CustomerValueProfile | undefined {
  const profile = values.get(id.trim());
  return profile ? cloneValue(profile) : undefined;
}

export function listCustomerValueProfiles(filter?: {
  accountRef?: string;
}): CustomerValueProfile[] {
  let result = [...values.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((p) => p.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValue);
}

export function clearCustomerValueProfiles(): void {
  values.clear();
}
