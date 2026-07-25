/**
 * Product Customer — Profile registry
 */

import {
  CUSTOMER_KINDS,
  CUSTOMER_STATUSES,
} from "../foundation/foundation.constants";
import type {
  CustomerKind,
  CustomerProfile,
  CustomerStatus,
  RegisterCustomerInput,
  UpdateCustomerStatusInput,
} from "./profile.types";

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

export function registerCustomer(
  input: RegisterCustomerInput,
): CustomerProfile {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) throw new Error("customer.name is required");
  if (!email) throw new Error("customer.email is required");
  if (!(CUSTOMER_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid customer kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("cusprf");
  if (profiles.has(id)) throw new Error(`customer already exists: ${id}`);

  const now = nowIso();
  const profile: CustomerProfile = {
    id,
    kind: input.kind,
    name,
    email,
    status: CUSTOMER_STATUSES[0],
    detail: `kind=${input.kind} status=PROSPECT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function updateCustomerStatus(
  input: UpdateCustomerStatusInput,
): CustomerProfile {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("customer.customerId is required");
  if (!(CUSTOMER_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid customer status: ${input.status}`);
  }

  const existing = profiles.get(customerId);
  if (!existing) throw new Error(`customer not found: ${customerId}`);

  const updated: CustomerProfile = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  profiles.set(customerId, updated);
  return cloneProfile(updated);
}

export function getCustomer(id: string): CustomerProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listCustomers(filter?: {
  kind?: CustomerKind;
  status?: CustomerStatus;
}): CustomerProfile[] {
  let result = [...profiles.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearCustomers(): void {
  profiles.clear();
}
