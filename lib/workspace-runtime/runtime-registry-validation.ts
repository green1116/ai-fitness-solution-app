import type { WorkspaceRuntimeSurface } from "./shared/runtime-constants";
import {
  validateProjectRuntime,
  validateQuoteRuntime,
  validateReportRuntime,
  validateWorkspaceRuntime,
} from "./runtime-validation";
import type { WorkspaceSurfaceRuntime } from "./runtime-types";
import type { RuntimeRegistryEntry, RuntimeRegistryKey, RuntimeRegistrySnapshot } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";

const REGISTRY_VALIDATORS: Record<RuntimeRegistryKey, (value: unknown) => boolean> = {
  workspace: validateWorkspaceRuntime,
  quote: validateQuoteRuntime,
  project: validateProjectRuntime,
  report: validateReportRuntime,
};

export function isRuntimeRegistryKey(value: unknown): value is RuntimeRegistryKey {
  return typeof value === "string" && RUNTIME_REGISTRY_KEYS.includes(value as RuntimeRegistryKey);
}

export function validateRuntimeRegistryEntry(value: unknown): value is RuntimeRegistryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeRegistryEntry>;
  if (!isRuntimeRegistryKey(candidate.key) || candidate.surface !== candidate.key) {
    return false;
  }
  if (candidate.layer !== "runtime-foundation") {
    return false;
  }
  return REGISTRY_VALIDATORS[candidate.key](candidate.runtime);
}

export function validateRuntimeRegistrySnapshot(value: unknown): value is RuntimeRegistrySnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeRegistrySnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  return RUNTIME_REGISTRY_KEYS.every((key) => validateRuntimeRegistryEntry(candidate.entries?.[key]));
}

export function validateRuntimeRegistryEntryForSurface(
  key: RuntimeRegistryKey,
  runtime: unknown,
  workspaceId: string,
): runtime is WorkspaceSurfaceRuntime {
  const validator = REGISTRY_VALIDATORS[key];
  if (!validator(runtime)) {
    return false;
  }
  const surfaceRuntime = runtime as WorkspaceSurfaceRuntime;
  return surfaceRuntime.identity.surface === key && surfaceRuntime.identity.workspaceId === workspaceId.trim();
}

export function assertRuntimeRegistryFoundationOnly(registry: RuntimeRegistrySnapshot): boolean {
  return (
    validateRuntimeRegistrySnapshot(registry) &&
    RUNTIME_REGISTRY_KEYS.every((key) => registry.entries[key].runtime.identity.workspaceId === registry.workspaceId)
  );
}

export function mapSurfaceToRegistryKey(surface: WorkspaceRuntimeSurface): RuntimeRegistryKey {
  return surface;
}
