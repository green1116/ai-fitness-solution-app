/**
 * Product Preference — Resolution rule registry
 */

import { PREFERENCE_RESOLUTION_STRATEGIES } from "../management/management.constants";
import { getPreference } from "../registry/preference.registry";
import type {
  DefinePreferenceResolutionRuleInput,
  PreferenceResolutionRule,
} from "./resolution.types";

const rules = new Map<string, PreferenceResolutionRule>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRule(rule: PreferenceResolutionRule): PreferenceResolutionRule {
  return { ...rule, metadata: { ...rule.metadata } };
}

export function definePreferenceResolutionRule(
  input: DefinePreferenceResolutionRuleInput,
): PreferenceResolutionRule {
  const preferenceId = input.preferenceId.trim();
  if (!preferenceId) throw new Error("resolution.preferenceId is required");
  if (
    !(PREFERENCE_RESOLUTION_STRATEGIES as readonly string[]).includes(
      input.strategy,
    )
  ) {
    throw new Error(`invalid resolution strategy: ${input.strategy}`);
  }
  if (!getPreference(preferenceId)) {
    throw new Error(`preference not found: ${preferenceId}`);
  }

  const duplicate = [...rules.values()].find(
    (r) => r.preferenceId === preferenceId,
  );
  if (duplicate) {
    throw new Error(`resolution rule already exists: ${preferenceId}`);
  }

  const id = input.id?.trim() || createId("prefrule");
  if (rules.has(id)) throw new Error(`resolution rule already exists: ${id}`);

  const rule: PreferenceResolutionRule = {
    id,
    preferenceId,
    strategy: input.strategy,
    respectOptOut: input.respectOptOut === true,
    detail: `strategy=${input.strategy} optOut=${input.respectOptOut === true}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  rules.set(id, rule);
  return cloneRule(rule);
}

export function getPreferenceResolutionRule(
  id: string,
): PreferenceResolutionRule | undefined {
  const rule = rules.get(id.trim());
  return rule ? cloneRule(rule) : undefined;
}

export function listPreferenceResolutionRules(filter?: {
  preferenceId?: string;
}): PreferenceResolutionRule[] {
  let result = [...rules.values()];
  if (filter?.preferenceId) {
    const preferenceId = filter.preferenceId.trim();
    result = result.filter((r) => r.preferenceId === preferenceId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRule);
}

export function clearPreferenceResolutionRules(): void {
  rules.clear();
}
