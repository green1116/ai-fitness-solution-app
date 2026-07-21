/**
 * Launch P3 — Sample Data Profile
 */

import { SAMPLE_DATA_KINDS } from "./demo.constants";
import { getDemoTenant } from "./demo.tenant";
import type {
  CreateSampleDataProfileInput,
  SampleDataEntry,
  SampleDataKind,
  SampleDataProfile,
} from "./demo.types";

const profiles = new Map<string, SampleDataProfile>();

const DEFAULT_ENTRIES: SampleDataEntry[] = [
  { kind: "USERS", count: 25, seedKey: "demo.users" },
  { kind: "WORKOUTS", count: 100, seedKey: "demo.workouts" },
  { kind: "METRICS", count: 500, seedKey: "demo.metrics" },
  { kind: "BILLING", count: 12, seedKey: "demo.billing" },
  { kind: "API_CALLS", count: 1000, seedKey: "demo.api_calls" },
];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: SampleDataProfile): SampleDataProfile {
  return {
    ...profile,
    entries: profile.entries.map((e) => ({ ...e })),
    metadata: { ...profile.metadata },
  };
}

export function createSampleDataProfile(
  input: CreateSampleDataProfileInput,
): SampleDataProfile {
  const demoTenantId = input.demoTenantId.trim();
  const name = input.name.trim();
  if (!name) throw new Error("sampleData.name is required");
  if (!getDemoTenant(demoTenantId)) {
    throw new Error(`demo tenant not found: ${demoTenantId}`);
  }

  const entries = input.entries ?? DEFAULT_ENTRIES;
  for (const entry of entries) {
    if (!(SAMPLE_DATA_KINDS as readonly string[]).includes(entry.kind)) {
      throw new Error(`invalid sample data kind: ${entry.kind}`);
    }
    if (entry.count < 0) throw new Error("sample data count must be non-negative");
  }

  const id = input.id?.trim() || createId("sample");
  if (profiles.has(id)) throw new Error(`sample data profile already exists: ${id}`);

  const profile: SampleDataProfile = {
    id,
    demoTenantId,
    name,
    entries: entries.map((e) => ({ ...e })),
    seeded: false,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function seedSampleDataProfile(id: string): SampleDataProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`sample data profile not found: ${id}`);
  profile.seeded = true;
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function resetSampleDataProfile(id: string): SampleDataProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`sample data profile not found: ${id}`);
  profile.seeded = false;
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function getSampleDataProfile(
  id: string,
): SampleDataProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listSampleDataProfiles(filter?: {
  demoTenantId?: string;
  seeded?: boolean;
}): SampleDataProfile[] {
  let result = [...profiles.values()];
  if (filter?.demoTenantId) {
    const tid = filter.demoTenantId.trim();
    result = result.filter((p) => p.demoTenantId === tid);
  }
  if (filter?.seeded !== undefined) {
    result = result.filter((p) => p.seeded === filter.seeded);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function getSampleEntryCount(
  profileId: string,
  kind: SampleDataKind,
): number {
  const profile = getSampleDataProfile(profileId);
  if (!profile || !profile.seeded) return 0;
  return profile.entries.find((e) => e.kind === kind)?.count ?? 0;
}

export function clearSampleDataProfiles(): void {
  profiles.clear();
}
