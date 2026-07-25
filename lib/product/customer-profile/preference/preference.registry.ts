/**
 * Product Customer Profile — Preference registry
 */

import { PREFERENCE_KINDS } from "../profile/profile.constants";
import { getIdentity } from "../identity/identity.registry";
import type {
  CustomerProfilePreference,
  PreferenceKind,
  SetPreferenceInput,
} from "./preference.types";

const preferences = new Map<string, CustomerProfilePreference>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePreference(
  preference: CustomerProfilePreference,
): CustomerProfilePreference {
  return { ...preference, metadata: { ...preference.metadata } };
}

export function setPreference(
  input: SetPreferenceInput,
): CustomerProfilePreference {
  const identityId = input.identityId.trim();
  const value = input.value.trim();
  if (!identityId) throw new Error("preference.identityId is required");
  if (!value) throw new Error("preference.value is required");
  if (!(PREFERENCE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid preference kind: ${input.kind}`);
  }
  if (!getIdentity(identityId)) {
    throw new Error(`identity not found: ${identityId}`);
  }

  const existing = [...preferences.values()].find(
    (p) => p.identityId === identityId && p.kind === input.kind,
  );
  const id = input.id?.trim() || existing?.id || createId("cprfpr");
  if (preferences.has(id) && existing && existing.id !== id) {
    throw new Error(`preference already exists: ${id}`);
  }

  const preference: CustomerProfilePreference = {
    id,
    identityId,
    kind: input.kind,
    value,
    detail: `kind=${input.kind} value=${value}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    setAt: nowIso(),
  };
  preferences.set(id, preference);
  return clonePreference(preference);
}

export function getPreference(
  id: string,
): CustomerProfilePreference | undefined {
  const preference = preferences.get(id.trim());
  return preference ? clonePreference(preference) : undefined;
}

export function listPreferences(filter?: {
  identityId?: string;
  kind?: PreferenceKind;
}): CustomerProfilePreference[] {
  let result = [...preferences.values()];
  if (filter?.identityId) {
    const identityId = filter.identityId.trim();
    result = result.filter((p) => p.identityId === identityId);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePreference);
}

export function clearPreferences(): void {
  preferences.clear();
}
