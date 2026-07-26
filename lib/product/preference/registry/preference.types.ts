/**
 * Product Preference — Registry types
 */

import type { PREFERENCE_KINDS } from "../management/management.constants";

export type PreferenceKind = (typeof PREFERENCE_KINDS)[number];
export type PreferenceMetadata = Record<string, unknown>;

export type NotificationPreference = {
  id: string;
  preferenceKey: string;
  name: string;
  kind: PreferenceKind;
  channelKey: string;
  templateKey: string;
  detail: string;
  metadata: PreferenceMetadata;
  createdAt: string;
};

export type RegisterPreferenceInput = {
  id?: string;
  preferenceKey: string;
  name: string;
  kind: PreferenceKind;
  channelKey: string;
  templateKey: string;
  metadata?: PreferenceMetadata;
};
