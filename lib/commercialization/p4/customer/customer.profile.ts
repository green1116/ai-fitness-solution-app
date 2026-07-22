/**
 * Commercialization P4 — Customer profile
 */

import { getCustomerAccount } from "../account/account.registry";
import type {
  CreateCustomerProfileInput,
  CustomerProfile,
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
  return { ...profile };
}

export function createCustomerProfile(
  input: CreateCustomerProfileInput,
): CustomerProfile {
  const accountId = input.accountId.trim();
  const displayName = input.displayName.trim();
  if (!displayName) throw new Error("customerProfile.displayName is required");

  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const id = input.id?.trim() || createId("cprof");
  if (profiles.has(id)) {
    throw new Error(`customer profile already exists: ${id}`);
  }

  const now = nowIso();
  const profile: CustomerProfile = {
    id,
    accountId,
    displayName,
    industry: (input.industry ?? "GENERAL").trim() || "GENERAL",
    companySize: (input.companySize ?? "UNKNOWN").trim() || "UNKNOWN",
    primaryContact:
      (input.primaryContact ?? account.owner).trim() || account.owner,
    detail: `account=${accountId} industry=${(input.industry ?? "GENERAL").trim() || "GENERAL"}`,
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getCustomerProfile(id: string): CustomerProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listCustomerProfiles(filter?: {
  accountId?: string;
}): CustomerProfile[] {
  let result = [...profiles.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((p) => p.accountId === aid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearCustomerProfiles(): void {
  profiles.clear();
}
