/**
 * Product P11 — Feature registry
 */

import { FEATURE_FLAGS } from "../release/release.constants";
import { getRelease } from "../release/release.registry";
import type {
  RegisterFeatureInput,
  ReleaseFeature,
  UpdateFeatureFlagInput,
} from "./feature.types";

const features = new Map<string, ReleaseFeature>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneFeature(feature: ReleaseFeature): ReleaseFeature {
  return { ...feature, metadata: { ...feature.metadata } };
}

export function registerFeature(input: RegisterFeatureInput): ReleaseFeature {
  const releaseId = input.releaseId.trim();
  const code = input.code.trim();
  const name = input.name.trim();
  if (!releaseId) throw new Error("feature.releaseId is required");
  if (!code) throw new Error("feature.code is required");
  if (!name) throw new Error("feature.name is required");
  if (!getRelease(releaseId)) {
    throw new Error(`release not found: ${releaseId}`);
  }

  const flag = input.flag ?? FEATURE_FLAGS[0];
  if (!(FEATURE_FLAGS as readonly string[]).includes(flag)) {
    throw new Error(`invalid feature flag: ${flag}`);
  }

  const id = input.id?.trim() || createId("p11ft");
  if (features.has(id)) {
    throw new Error(`feature already exists: ${id}`);
  }

  const feature: ReleaseFeature = {
    id,
    releaseId,
    code,
    name,
    flag,
    detail: `flag=${flag} code=${code}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  features.set(id, feature);
  return cloneFeature(feature);
}

export function updateFeatureFlag(
  input: UpdateFeatureFlagInput,
): ReleaseFeature {
  const featureId = input.featureId.trim();
  if (!featureId) throw new Error("feature.featureId is required");
  if (!(FEATURE_FLAGS as readonly string[]).includes(input.flag)) {
    throw new Error(`invalid feature flag: ${input.flag}`);
  }
  const existing = features.get(featureId);
  if (!existing) throw new Error(`feature not found: ${featureId}`);

  const updated: ReleaseFeature = {
    ...existing,
    flag: input.flag,
    detail: `flag=${input.flag} code=${existing.code}`,
    metadata: { ...existing.metadata },
  };
  features.set(featureId, updated);
  return cloneFeature(updated);
}

export function getFeature(id: string): ReleaseFeature | undefined {
  const feature = features.get(id.trim());
  return feature ? cloneFeature(feature) : undefined;
}

export function listFeatures(filter?: {
  releaseId?: string;
}): ReleaseFeature[] {
  let result = [...features.values()];
  if (filter?.releaseId) {
    const rid = filter.releaseId.trim();
    result = result.filter((f) => f.releaseId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFeature);
}

export function clearFeatures(): void {
  features.clear();
}
