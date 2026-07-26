/**
 * Product Preference — Consent / opt-out types
 */

import type { PREFERENCE_CONSENT_STATES } from "../management/management.constants";

export type PreferenceConsentState =
  (typeof PREFERENCE_CONSENT_STATES)[number];
export type ConsentMetadata = Record<string, unknown>;

export type PreferenceConsent = {
  id: string;
  preferenceId: string;
  scopeId: string;
  state: PreferenceConsentState;
  detail: string;
  metadata: ConsentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RecordPreferenceConsentInput = {
  id?: string;
  preferenceId: string;
  scopeId: string;
  state: PreferenceConsentState;
  metadata?: ConsentMetadata;
};

export type UpdatePreferenceConsentInput = {
  consentId: string;
  state: PreferenceConsentState;
};
