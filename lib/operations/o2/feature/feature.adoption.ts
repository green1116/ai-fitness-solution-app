/**
 * Operations O2 — Feature adoption
 */

import { FEATURE_ADOPTION_LEVELS } from "../usage/usage.constants";
import type {
  FeatureAdoption,
  FeatureAdoptionLevel,
  RecordFeatureAdoptionInput,
} from "./feature.types";

const adoptions = new Map<string, FeatureAdoption>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAdoption(adoption: FeatureAdoption): FeatureAdoption {
  return { ...adoption, metadata: { ...adoption.metadata } };
}

export function recordFeatureAdoption(
  input: RecordFeatureAdoptionInput,
): FeatureAdoption {
  const accountRef = input.accountRef.trim();
  const featureKey = input.featureKey.trim();
  if (!accountRef) throw new Error("feature.accountRef is required");
  if (!featureKey) throw new Error("feature.featureKey is required");
  if (
    !(FEATURE_ADOPTION_LEVELS as readonly string[]).includes(input.level)
  ) {
    throw new Error(`invalid feature adoption level: ${input.level}`);
  }
  if (!Number.isFinite(input.activeUsers) || input.activeUsers < 0) {
    throw new Error("feature.activeUsers must be a non-negative number");
  }

  const id = input.id?.trim() || createId("o2fad");
  if (adoptions.has(id)) {
    throw new Error(`feature adoption already exists: ${id}`);
  }

  const activeUsers = Math.round(input.activeUsers);
  const adoption: FeatureAdoption = {
    id,
    accountRef,
    featureKey,
    level: input.level,
    activeUsers,
    detail: `feature=${featureKey} level=${input.level} users=${activeUsers}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  adoptions.set(id, adoption);
  return cloneAdoption(adoption);
}

export function getFeatureAdoption(
  id: string,
): FeatureAdoption | undefined {
  const adoption = adoptions.get(id.trim());
  return adoption ? cloneAdoption(adoption) : undefined;
}

export function listFeatureAdoptions(filter?: {
  accountRef?: string;
  level?: FeatureAdoptionLevel;
}): FeatureAdoption[] {
  let result = [...adoptions.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((a) => a.accountRef === aref);
  }
  if (filter?.level) result = result.filter((a) => a.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAdoption);
}

export function clearFeatureAdoptions(): void {
  adoptions.clear();
}
