/**
 * Product Preference — readiness / manifest types
 */

import type {
  PREFERENCE_MANAGER_STATUSES,
  PREFERENCE_READINESS_VERDICTS,
  PRODUCT_PREFERENCE_MANAGEMENT_BASE,
  PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_ID,
  PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
} from "./management.constants";

export type PreferenceReadinessVerdict =
  (typeof PREFERENCE_READINESS_VERDICTS)[number];
export type PreferenceManagerStatus =
  (typeof PREFERENCE_MANAGER_STATUSES)[number];

export type PreferenceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PreferenceReadinessResult = {
  verdict: PreferenceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PreferenceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PreferenceRegistryManifest = {
  managementId: typeof PRODUCT_PREFERENCE_MANAGEMENT_ID;
  version: typeof PRODUCT_PREFERENCE_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_PREFERENCE_MANAGEMENT_BASE;
  preferenceCount: number;
  scopeCount: number;
  consentCount: number;
  resolutionCount: number;
  validationCount: number;
  releaseCount: number;
};
