/**
 * Product Preference — Scope registry
 */

import { PREFERENCE_SCOPE_LEVELS } from "../management/management.constants";
import { getPreference } from "../registry/preference.registry";
import type {
  AttachPreferenceScopeInput,
  PreferenceScope,
  PreferenceScopeLevel,
} from "./scope.types";

const scopes = new Map<string, PreferenceScope>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScope(scope: PreferenceScope): PreferenceScope {
  return { ...scope, metadata: { ...scope.metadata } };
}

export function attachPreferenceScope(
  input: AttachPreferenceScopeInput,
): PreferenceScope {
  const preferenceId = input.preferenceId.trim();
  const subjectKey = input.subjectKey.trim().toUpperCase();
  if (!preferenceId) throw new Error("scope.preferenceId is required");
  if (!subjectKey) throw new Error("scope.subjectKey is required");
  if (!(PREFERENCE_SCOPE_LEVELS as readonly string[]).includes(input.level)) {
    throw new Error(`invalid scope level: ${input.level}`);
  }
  if (!getPreference(preferenceId)) {
    throw new Error(`preference not found: ${preferenceId}`);
  }

  const duplicate = [...scopes.values()].find(
    (s) =>
      s.preferenceId === preferenceId &&
      s.level === input.level &&
      s.subjectKey === subjectKey,
  );
  if (duplicate) {
    throw new Error(`scope already exists: ${input.level}/${subjectKey}`);
  }

  const id = input.id?.trim() || createId("prefscope");
  if (scopes.has(id)) throw new Error(`scope already exists: ${id}`);

  const scope: PreferenceScope = {
    id,
    preferenceId,
    level: input.level,
    subjectKey,
    detail: `level=${input.level} subject=${subjectKey}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  scopes.set(id, scope);
  return cloneScope(scope);
}

export function getPreferenceScope(id: string): PreferenceScope | undefined {
  const scope = scopes.get(id.trim());
  return scope ? cloneScope(scope) : undefined;
}

export function listPreferenceScopes(filter?: {
  preferenceId?: string;
  level?: PreferenceScopeLevel;
}): PreferenceScope[] {
  let result = [...scopes.values()];
  if (filter?.preferenceId) {
    const preferenceId = filter.preferenceId.trim();
    result = result.filter((s) => s.preferenceId === preferenceId);
  }
  if (filter?.level) result = result.filter((s) => s.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScope);
}

export function clearPreferenceScopes(): void {
  scopes.clear();
}
