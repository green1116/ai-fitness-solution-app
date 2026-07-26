/**
 * Product Partner — profile registry
 */

import { getPartner } from "../registry/partner.registry";
import type {
  PartnerProfile,
  RegisterPartnerProfileInput,
} from "./profile.types";

const profiles = new Map<string, PartnerProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: PartnerProfile): PartnerProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function registerPartnerProfile(
  input: RegisterPartnerProfileInput,
): PartnerProfile {
  const partnerId = input.partnerId.trim();
  const profileKey = input.profileKey.trim().toUpperCase();
  const legalName = input.legalName.trim();
  const contactRef = input.contactRef.trim().toUpperCase();
  if (!partnerId) throw new Error("profile.partnerId is required");
  if (!profileKey) throw new Error("profile.profileKey is required");
  if (!legalName) throw new Error("profile.legalName is required");
  if (!contactRef) throw new Error("profile.contactRef is required");

  const partner = getPartner(partnerId);
  if (!partner) throw new Error(`partner not found: ${partnerId}`);
  if (partner.status === "RETIRED") {
    throw new Error(`partner retired: ${partnerId}`);
  }

  const duplicate = [...profiles.values()].find(
    (p) => p.partnerId === partnerId && p.profileKey === profileKey,
  );
  if (duplicate) {
    throw new Error(`profileKey already exists: ${profileKey}`);
  }

  const id = input.id?.trim() || createId("partnerprof");
  if (profiles.has(id)) throw new Error(`profile already exists: ${id}`);

  const profile: PartnerProfile = {
    id,
    partnerId,
    profileKey,
    legalName,
    contactRef,
    detail: `legal=${legalName}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getPartnerProfile(id: string): PartnerProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listPartnerProfiles(filter?: {
  partnerId?: string;
}): PartnerProfile[] {
  let result = [...profiles.values()];
  if (filter?.partnerId) {
    const partnerId = filter.partnerId.trim();
    result = result.filter((p) => p.partnerId === partnerId);
  }
  return result
    .slice()
    .sort((a, b) => a.profileKey.localeCompare(b.profileKey))
    .map(cloneProfile);
}

export function clearPartnerProfiles(): void {
  profiles.clear();
}
