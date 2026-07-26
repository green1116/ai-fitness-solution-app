/**
 * Product Preference — Registry
 */

import { PREFERENCE_KINDS } from "../management/management.constants";
import type {
  NotificationPreference,
  PreferenceKind,
  RegisterPreferenceInput,
} from "./preference.types";

const preferences = new Map<string, NotificationPreference>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePreference(
  preference: NotificationPreference,
): NotificationPreference {
  return { ...preference, metadata: { ...preference.metadata } };
}

export function registerPreference(
  input: RegisterPreferenceInput,
): NotificationPreference {
  const preferenceKey = input.preferenceKey.trim().toUpperCase();
  const name = input.name.trim();
  const channelKey = input.channelKey.trim().toUpperCase();
  const templateKey = input.templateKey.trim().toUpperCase();
  if (!preferenceKey) throw new Error("preference.preferenceKey is required");
  if (!name) throw new Error("preference.name is required");
  if (!channelKey) throw new Error("preference.channelKey is required");
  if (!templateKey) throw new Error("preference.templateKey is required");
  if (!(PREFERENCE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid preference kind: ${input.kind}`);
  }
  if (keys.has(preferenceKey)) {
    throw new Error(`preferenceKey already exists: ${preferenceKey}`);
  }

  const id = input.id?.trim() || createId("pref");
  if (preferences.has(id)) throw new Error(`preference already exists: ${id}`);

  const preference: NotificationPreference = {
    id,
    preferenceKey,
    name,
    kind: input.kind,
    channelKey,
    templateKey,
    detail: `key=${preferenceKey} kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  preferences.set(id, preference);
  keys.set(preferenceKey, id);
  return clonePreference(preference);
}

export function getPreference(id: string): NotificationPreference | undefined {
  const preference = preferences.get(id.trim());
  return preference ? clonePreference(preference) : undefined;
}

export function getPreferenceByKey(
  preferenceKey: string,
): NotificationPreference | undefined {
  const id = keys.get(preferenceKey.trim().toUpperCase());
  return id ? getPreference(id) : undefined;
}

export function listPreferences(filter?: {
  kind?: PreferenceKind;
}): NotificationPreference[] {
  let result = [...preferences.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.preferenceKey.localeCompare(b.preferenceKey))
    .map(clonePreference);
}

export function clearPreferences(): void {
  preferences.clear();
  keys.clear();
}
