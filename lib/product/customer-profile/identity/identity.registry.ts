/**
 * Product Customer Profile — Identity registry
 */

import { PROFILE_STATUSES } from "../profile/profile.constants";
import type {
  CustomerProfileIdentity,
  ProfileStatus,
  UpdateIdentityStatusInput,
  UpsertIdentityInput,
} from "./identity.types";

const identities = new Map<string, CustomerProfileIdentity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIdentity(
  identity: CustomerProfileIdentity,
): CustomerProfileIdentity {
  return { ...identity, metadata: { ...identity.metadata } };
}

export function upsertIdentity(
  input: UpsertIdentityInput,
): CustomerProfileIdentity {
  const customerId = input.customerId.trim();
  const displayName = input.displayName.trim();
  const legalName = input.legalName.trim();
  if (!customerId) throw new Error("identity.customerId is required");
  if (!displayName) throw new Error("identity.displayName is required");
  if (!legalName) throw new Error("identity.legalName is required");

  const existingByCustomer = [...identities.values()].find(
    (i) => i.customerId === customerId,
  );
  if (existingByCustomer && !input.id) {
    throw new Error(`identity already exists for customer: ${customerId}`);
  }

  const id = input.id?.trim() || createId("cprfid");
  if (identities.has(id) && !existingByCustomer) {
    throw new Error(`identity already exists: ${id}`);
  }

  const now = nowIso();
  const prior = identities.get(id);
  const identity: CustomerProfileIdentity = {
    id,
    customerId,
    displayName,
    legalName,
    status: prior?.status ?? PROFILE_STATUSES[0],
    detail: `status=${prior?.status ?? "DRAFT"}`,
    metadata: { ...(input.metadata ?? prior?.metadata ?? {}) },
    createdAt: prior?.createdAt ?? now,
    updatedAt: now,
  };
  identities.set(id, identity);
  return cloneIdentity(identity);
}

export function updateIdentityStatus(
  input: UpdateIdentityStatusInput,
): CustomerProfileIdentity {
  const identityId = input.identityId.trim();
  if (!identityId) throw new Error("identity.identityId is required");
  if (!(PROFILE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid profile status: ${input.status}`);
  }

  const existing = identities.get(identityId);
  if (!existing) throw new Error(`identity not found: ${identityId}`);

  const updated: CustomerProfileIdentity = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  identities.set(identityId, updated);
  return cloneIdentity(updated);
}

export function getIdentity(
  id: string,
): CustomerProfileIdentity | undefined {
  const identity = identities.get(id.trim());
  return identity ? cloneIdentity(identity) : undefined;
}

export function listIdentities(filter?: {
  customerId?: string;
  status?: ProfileStatus;
}): CustomerProfileIdentity[] {
  let result = [...identities.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((i) => i.customerId === customerId);
  }
  if (filter?.status) {
    result = result.filter((i) => i.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIdentity);
}

export function clearIdentities(): void {
  identities.clear();
}
