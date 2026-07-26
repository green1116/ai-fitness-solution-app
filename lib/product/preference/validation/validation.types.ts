/**
 * Product Preference — Validation types
 */

import type { PREFERENCE_VALIDATION_VERDICTS } from "../management/management.constants";

export type PreferenceValidationVerdict =
  (typeof PREFERENCE_VALIDATION_VERDICTS)[number];
export type ValidationMetadata = Record<string, unknown>;

export type PreferenceValidation = {
  id: string;
  preferenceId: string;
  verdict: PreferenceValidationVerdict;
  reasons: string[];
  detail: string;
  metadata: ValidationMetadata;
  createdAt: string;
};

export type ValidatePreferenceInput = {
  id?: string;
  preferenceId: string;
  metadata?: ValidationMetadata;
};
