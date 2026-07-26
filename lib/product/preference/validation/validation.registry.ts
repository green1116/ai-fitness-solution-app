/**
 * Product Preference — Validation registry (offline, deterministic)
 */

import { listPreferenceConsents } from "../consent/consent.registry";
import { getPreference } from "../registry/preference.registry";
import { listPreferenceResolutionRules } from "../resolution/resolution.registry";
import { listPreferenceScopes } from "../scope/scope.registry";
import type {
  PreferenceValidation,
  PreferenceValidationVerdict,
  ValidatePreferenceInput,
} from "./validation.types";

const validations = new Map<string, PreferenceValidation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValidation(
  validation: PreferenceValidation,
): PreferenceValidation {
  return {
    ...validation,
    reasons: [...validation.reasons],
    metadata: { ...validation.metadata },
  };
}

export function validatePreference(
  input: ValidatePreferenceInput,
): PreferenceValidation {
  const preferenceId = input.preferenceId.trim();
  if (!preferenceId) throw new Error("validation.preferenceId is required");

  const preference = getPreference(preferenceId);
  if (!preference) throw new Error(`preference not found: ${preferenceId}`);

  const reasons: string[] = [];
  if (!preference.preferenceKey) reasons.push("preference_key_missing");
  if (!preference.channelKey) reasons.push("channel_key_missing");
  if (!preference.templateKey) reasons.push("template_key_missing");

  const scopes = listPreferenceScopes({ preferenceId });
  if (scopes.length < 1) reasons.push("scope_missing");

  const consents = listPreferenceConsents({ preferenceId });
  if (consents.length < 1) reasons.push("consent_missing");

  const rules = listPreferenceResolutionRules({ preferenceId });
  if (rules.length < 1) reasons.push("resolution_missing");
  else if (rules[0].respectOptOut !== true) {
    reasons.push("resolution_opt_out_required");
  }

  let verdict: PreferenceValidationVerdict = "VALID";
  if (reasons.length > 0) {
    const structural =
      reasons.includes("scope_missing") ||
      reasons.includes("consent_missing") ||
      reasons.includes("resolution_missing");
    verdict = structural ? "INCOMPLETE" : "INVALID";
  }

  const id = input.id?.trim() || createId("prefval");
  if (validations.has(id)) throw new Error(`validation already exists: ${id}`);

  const validation: PreferenceValidation = {
    id,
    preferenceId,
    verdict,
    reasons,
    detail: `verdict=${verdict} reasons=${reasons.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  validations.set(id, validation);
  return cloneValidation(validation);
}

export function getPreferenceValidation(
  id: string,
): PreferenceValidation | undefined {
  const validation = validations.get(id.trim());
  return validation ? cloneValidation(validation) : undefined;
}

export function listPreferenceValidations(filter?: {
  preferenceId?: string;
}): PreferenceValidation[] {
  let result = [...validations.values()];
  if (filter?.preferenceId) {
    const preferenceId = filter.preferenceId.trim();
    result = result.filter((v) => v.preferenceId === preferenceId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValidation);
}

export function clearPreferenceValidations(): void {
  validations.clear();
}
