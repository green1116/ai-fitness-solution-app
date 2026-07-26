/**
 * Product Preference — Scope types
 */

import type { PREFERENCE_SCOPE_LEVELS } from "../management/management.constants";

export type PreferenceScopeLevel = (typeof PREFERENCE_SCOPE_LEVELS)[number];
export type ScopeMetadata = Record<string, unknown>;

export type PreferenceScope = {
  id: string;
  preferenceId: string;
  level: PreferenceScopeLevel;
  subjectKey: string;
  detail: string;
  metadata: ScopeMetadata;
  createdAt: string;
};

export type AttachPreferenceScopeInput = {
  id?: string;
  preferenceId: string;
  level: PreferenceScopeLevel;
  subjectKey: string;
  metadata?: ScopeMetadata;
};
