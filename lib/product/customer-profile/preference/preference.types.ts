/**
 * Product Customer Profile — Preference types
 */

import type { PREFERENCE_KINDS } from "../profile/profile.constants";

export type PreferenceKind = (typeof PREFERENCE_KINDS)[number];
export type PreferenceMetadata = Record<string, unknown>;

export type CustomerProfilePreference = {
  id: string;
  identityId: string;
  kind: PreferenceKind;
  value: string;
  detail: string;
  metadata: PreferenceMetadata;
  setAt: string;
};

export type SetPreferenceInput = {
  id?: string;
  identityId: string;
  kind: PreferenceKind;
  value: string;
  metadata?: PreferenceMetadata;
};
