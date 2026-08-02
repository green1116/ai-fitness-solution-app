/**
 * FEAT-31 — Customer Profile
 * In-memory customer profile domain built on Customer Registry.
 */
import { existsCustomer } from "./customer-registry";

export const FEAT_31_ID = "FEAT-31" as const;
export const CUSTOMER_PROFILE_CAPABILITY = "CustomerProfile" as const;

export type CustomerProfile = Readonly<{
  customerId: string;
  displayName: string;
  industry: string;
  companySize: string;
  country: string;
  timezone: string;
  contactName: string;
  contactPhone: string;
  notes: string;
  updatedAt: string;
}>;

export type CreateCustomerProfileInput = Readonly<{
  customerId: string;
  displayName: string;
  industry?: string;
  companySize?: string;
  country?: string;
  timezone?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}>;

export type UpdateCustomerProfileInput = Readonly<{
  customerId: string;
  displayName?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  timezone?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}>;

export type ListCustomerProfilesFilter = Readonly<{
  industry?: string;
  country?: string;
}>;

const profiles = new Map<string, CustomerProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneProfile(profile: CustomerProfile): CustomerProfile {
  return { ...profile };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`customerProfile.${field} is required`);
  return trimmed;
}

function optionalTrimmed(value: string | undefined): string {
  return (value ?? "").trim();
}

function requireRegisteredCustomer(customerId: string): string {
  const id = requireTrimmed(customerId, "customerId");
  if (!existsCustomer(id)) {
    throw new Error(`customer not found in registry: ${id}`);
  }
  return id;
}

/**
 * Create a profile for an existing registered customer.
 */
export function createCustomerProfile(
  input: CreateCustomerProfileInput,
): CustomerProfile {
  const customerId = requireRegisteredCustomer(input.customerId);
  if (profiles.has(customerId)) {
    throw new Error(`customer profile already exists: ${customerId}`);
  }

  const displayName = requireTrimmed(input.displayName, "displayName");
  const profile: CustomerProfile = {
    customerId,
    displayName,
    industry: optionalTrimmed(input.industry),
    companySize: optionalTrimmed(input.companySize),
    country: optionalTrimmed(input.country),
    timezone: optionalTrimmed(input.timezone),
    contactName: optionalTrimmed(input.contactName),
    contactPhone: optionalTrimmed(input.contactPhone),
    notes: optionalTrimmed(input.notes),
    updatedAt: nowIso(),
  };
  profiles.set(customerId, profile);
  return cloneProfile(profile);
}

/**
 * Get a customer profile by customerId.
 */
export function getCustomerProfile(
  customerId: string,
): CustomerProfile | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const profile = profiles.get(id);
  return profile ? cloneProfile(profile) : undefined;
}

/**
 * Update an existing customer profile (customer must remain registered).
 */
export function updateCustomerProfile(
  input: UpdateCustomerProfileInput,
): CustomerProfile {
  const customerId = requireRegisteredCustomer(input.customerId);
  const existing = profiles.get(customerId);
  if (!existing) {
    throw new Error(`customer profile not found: ${customerId}`);
  }

  const updated: CustomerProfile = {
    ...existing,
    displayName:
      input.displayName !== undefined
        ? requireTrimmed(input.displayName, "displayName")
        : existing.displayName,
    industry:
      input.industry !== undefined
        ? optionalTrimmed(input.industry)
        : existing.industry,
    companySize:
      input.companySize !== undefined
        ? optionalTrimmed(input.companySize)
        : existing.companySize,
    country:
      input.country !== undefined
        ? optionalTrimmed(input.country)
        : existing.country,
    timezone:
      input.timezone !== undefined
        ? optionalTrimmed(input.timezone)
        : existing.timezone,
    contactName:
      input.contactName !== undefined
        ? optionalTrimmed(input.contactName)
        : existing.contactName,
    contactPhone:
      input.contactPhone !== undefined
        ? optionalTrimmed(input.contactPhone)
        : existing.contactPhone,
    notes:
      input.notes !== undefined ? optionalTrimmed(input.notes) : existing.notes,
    updatedAt: nowIso(),
  };
  profiles.set(customerId, updated);
  return cloneProfile(updated);
}

/**
 * List customer profiles with optional industry / country filters.
 */
export function listCustomerProfiles(
  filter: ListCustomerProfilesFilter = {},
): CustomerProfile[] {
  let rows = [...profiles.values()];
  if (filter.industry) {
    const industry = filter.industry.trim();
    rows = rows.filter((p) => p.industry === industry);
  }
  if (filter.country) {
    const country = filter.country.trim();
    rows = rows.filter((p) => p.country === country);
  }
  return rows
    .slice()
    .sort((a, b) => a.customerId.localeCompare(b.customerId))
    .map(cloneProfile);
}

/** Test helper — clears in-memory profiles. */
export function clearCustomerProfiles(): void {
  profiles.clear();
}
