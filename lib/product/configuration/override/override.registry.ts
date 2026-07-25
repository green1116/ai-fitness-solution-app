/**
 * Product Configuration — Override registry
 */

import { CONFIG_OVERRIDE_TARGETS } from "../management/management.constants";
import { getConfigParameter } from "../parameter/parameter.registry";
import type {
  ApplyConfigOverrideInput,
  ConfigOverride,
  ConfigOverrideTarget,
} from "./override.types";

const overrides = new Map<string, ConfigOverride>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOverride(override: ConfigOverride): ConfigOverride {
  return { ...override, metadata: { ...override.metadata } };
}

export function applyConfigOverride(
  input: ApplyConfigOverrideInput,
): ConfigOverride {
  const parameterId = input.parameterId.trim();
  const targetRef = input.targetRef.trim();
  const value = input.value.trim();
  const userAccountId = input.userAccountId.trim();
  if (!parameterId) throw new Error("override.parameterId is required");
  if (!targetRef) throw new Error("override.targetRef is required");
  if (!value) throw new Error("override.value is required");
  if (!userAccountId) throw new Error("override.userAccountId is required");
  if (!(CONFIG_OVERRIDE_TARGETS as readonly string[]).includes(input.target)) {
    throw new Error(`invalid override target: ${input.target}`);
  }
  if (!getConfigParameter(parameterId)) {
    throw new Error(`parameter not found: ${parameterId}`);
  }

  const existing = [...overrides.values()].find(
    (o) =>
      o.parameterId === parameterId &&
      o.target === input.target &&
      o.targetRef === targetRef,
  );
  const id = input.id?.trim() || existing?.id || createId("cfgovr");
  if (overrides.has(id) && existing && existing.id !== id) {
    throw new Error(`override already exists: ${id}`);
  }

  const override: ConfigOverride = {
    id,
    parameterId,
    target: input.target,
    targetRef,
    value,
    userAccountId,
    detail: `target=${input.target} ref=${targetRef}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    appliedAt: nowIso(),
  };
  overrides.set(id, override);
  return cloneOverride(override);
}

export function getConfigOverride(id: string): ConfigOverride | undefined {
  const override = overrides.get(id.trim());
  return override ? cloneOverride(override) : undefined;
}

export function listConfigOverrides(filter?: {
  parameterId?: string;
  target?: ConfigOverrideTarget;
  userAccountId?: string;
}): ConfigOverride[] {
  let result = [...overrides.values()];
  if (filter?.parameterId) {
    const parameterId = filter.parameterId.trim();
    result = result.filter((o) => o.parameterId === parameterId);
  }
  if (filter?.target) {
    result = result.filter((o) => o.target === filter.target);
  }
  if (filter?.userAccountId) {
    const userAccountId = filter.userAccountId.trim();
    result = result.filter((o) => o.userAccountId === userAccountId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOverride);
}

export function clearConfigOverrides(): void {
  overrides.clear();
}
