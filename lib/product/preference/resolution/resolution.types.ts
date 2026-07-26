/**
 * Product Preference — Resolution rule types
 */

import type { PREFERENCE_RESOLUTION_STRATEGIES } from "../management/management.constants";

export type PreferenceResolutionStrategy =
  (typeof PREFERENCE_RESOLUTION_STRATEGIES)[number];
export type ResolutionMetadata = Record<string, unknown>;

export type PreferenceResolutionRule = {
  id: string;
  preferenceId: string;
  strategy: PreferenceResolutionStrategy;
  respectOptOut: boolean;
  detail: string;
  metadata: ResolutionMetadata;
  createdAt: string;
};

export type DefinePreferenceResolutionRuleInput = {
  id?: string;
  preferenceId: string;
  strategy: PreferenceResolutionStrategy;
  respectOptOut: boolean;
  metadata?: ResolutionMetadata;
};
