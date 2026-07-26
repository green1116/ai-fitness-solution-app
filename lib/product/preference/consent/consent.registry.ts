/**
 * Product Preference — Consent / opt-out registry
 */

import { PREFERENCE_CONSENT_STATES } from "../management/management.constants";
import { getPreference } from "../registry/preference.registry";
import { getPreferenceScope } from "../scope/scope.registry";
import type {
  PreferenceConsent,
  PreferenceConsentState,
  RecordPreferenceConsentInput,
  UpdatePreferenceConsentInput,
} from "./consent.types";

const consents = new Map<string, PreferenceConsent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneConsent(consent: PreferenceConsent): PreferenceConsent {
  return { ...consent, metadata: { ...consent.metadata } };
}

export function recordPreferenceConsent(
  input: RecordPreferenceConsentInput,
): PreferenceConsent {
  const preferenceId = input.preferenceId.trim();
  const scopeId = input.scopeId.trim();
  if (!preferenceId) throw new Error("consent.preferenceId is required");
  if (!scopeId) throw new Error("consent.scopeId is required");
  if (!(PREFERENCE_CONSENT_STATES as readonly string[]).includes(input.state)) {
    throw new Error(`invalid consent state: ${input.state}`);
  }
  if (!getPreference(preferenceId)) {
    throw new Error(`preference not found: ${preferenceId}`);
  }
  const scope = getPreferenceScope(scopeId);
  if (!scope) throw new Error(`scope not found: ${scopeId}`);
  if (scope.preferenceId !== preferenceId) {
    throw new Error(`scope preference mismatch: ${scopeId}`);
  }

  const duplicate = [...consents.values()].find(
    (c) => c.preferenceId === preferenceId && c.scopeId === scopeId,
  );
  if (duplicate) throw new Error(`consent already exists: ${scopeId}`);

  const id = input.id?.trim() || createId("prefcon");
  if (consents.has(id)) throw new Error(`consent already exists: ${id}`);

  const now = nowIso();
  const consent: PreferenceConsent = {
    id,
    preferenceId,
    scopeId,
    state: input.state,
    detail: `state=${input.state}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  consents.set(id, consent);
  return cloneConsent(consent);
}

export function updatePreferenceConsent(
  input: UpdatePreferenceConsentInput,
): PreferenceConsent {
  const consentId = input.consentId.trim();
  if (!consentId) throw new Error("consent.consentId is required");
  if (!(PREFERENCE_CONSENT_STATES as readonly string[]).includes(input.state)) {
    throw new Error(`invalid consent state: ${input.state}`);
  }

  const existing = consents.get(consentId);
  if (!existing) throw new Error(`consent not found: ${consentId}`);

  const updated: PreferenceConsent = {
    ...existing,
    state: input.state,
    detail: `state=${input.state}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  consents.set(consentId, updated);
  return cloneConsent(updated);
}

export function getPreferenceConsent(
  id: string,
): PreferenceConsent | undefined {
  const consent = consents.get(id.trim());
  return consent ? cloneConsent(consent) : undefined;
}

export function listPreferenceConsents(filter?: {
  preferenceId?: string;
  state?: PreferenceConsentState;
}): PreferenceConsent[] {
  let result = [...consents.values()];
  if (filter?.preferenceId) {
    const preferenceId = filter.preferenceId.trim();
    result = result.filter((c) => c.preferenceId === preferenceId);
  }
  if (filter?.state) result = result.filter((c) => c.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConsent);
}

export function clearPreferenceConsents(): void {
  consents.clear();
}
