/**
 * Launch L1 — Customer profile
 */

import { CUSTOMER_SEGMENTS } from "../demo/demo.constants";
import { getTenant } from "../tenant/tenant.registry";
import type {
  CreateCustomerProfileInput,
  CustomerProfile,
  CustomerSegment,
} from "./customer.types";

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
  const displayName = input.displayName.trim();
  const tenantId = input.tenantId.trim();
  const contactEmail = input.contactEmail.trim().toLowerCase();
  if (!displayName) throw new Error("customer.displayName is required");
  if (!tenantId) throw new Error("customer.tenantId is required");
  if (!contactEmail) throw new Error("customer.contactEmail is required");
  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }
  if (!(CUSTOMER_SEGMENTS as readonly string[]).includes(input.segment)) {
    throw new Error(`invalid customer segment: ${input.segment}`);
  }

  const id = input.id?.trim() || createId("l1cus");
  if (profiles.has(id)) {
    throw new Error(`customer profile already exists: ${id}`);
  }

  const now = nowIso();
  const profile: CustomerProfile = {
    id,
    tenantId,
    displayName,
    segment: input.segment,
    contactEmail,
    detail: `segment=${input.segment} email=${contactEmail}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getCustomerProfile(
  id: string,
): CustomerProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listCustomerProfiles(filter?: {
  tenantId?: string;
  segment?: CustomerSegment;
}): CustomerProfile[] {
  let result = [...profiles.values()];
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tid);
  }
  if (filter?.segment) {
    result = result.filter((p) => p.segment === filter.segment);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearCustomerProfiles(): void {
  profiles.clear();
}
