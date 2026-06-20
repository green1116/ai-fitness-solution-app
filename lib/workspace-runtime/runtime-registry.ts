import type { WorkspaceRuntimeContext } from "./runtime-context";
import { RUNTIME_REGISTRY_VERSION, type WorkspaceRuntimeSurface } from "./shared/runtime-constants";
import type {
  ProjectRuntime,
  QuoteRuntime,
  ReportRuntime,
  WorkspaceRuntime,
  WorkspaceSurfaceRuntime,
} from "./runtime-types";
import type {
  RuntimeRegistryEntry,
  RuntimeRegistryKey,
  RuntimeRegistrySnapshot,
} from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import {
  validateRuntimeRegistryEntryForSurface,
  validateRuntimeRegistrySnapshot,
} from "./runtime-registry-validation";

function createRegistryEntry<T extends WorkspaceSurfaceRuntime>(
  key: RuntimeRegistryKey,
  runtime: T,
): RuntimeRegistryEntry<T> {
  return {
    key,
    surface: key as WorkspaceRuntimeSurface,
    runtime,
    layer: "runtime-foundation",
  };
}

function buildRegistryEntries(context: WorkspaceRuntimeContext): RuntimeRegistrySnapshot["entries"] {
  return {
    workspace: createRegistryEntry("workspace", context.workspace),
    quote: createRegistryEntry("quote", context.quote),
    project: createRegistryEntry("project", context.project),
    report: createRegistryEntry("report", context.report),
  };
}

export function createFoundationRuntimeRegistry(context: WorkspaceRuntimeContext): RuntimeRegistrySnapshot {
  return {
    workspaceId: context.workspaceId,
    version: RUNTIME_REGISTRY_VERSION,
    entries: buildRegistryEntries(context),
  };
}

export function registerRuntimeEntry(
  registry: RuntimeRegistrySnapshot,
  key: RuntimeRegistryKey,
  runtime: WorkspaceSurfaceRuntime,
): RuntimeRegistrySnapshot {
  if (!validateRuntimeRegistryEntryForSurface(key, runtime, registry.workspaceId)) {
    throw new Error(`Invalid runtime registry entry for key=${key}`);
  }

  return {
    ...registry,
    entries: {
      ...registry.entries,
      [key]: createRegistryEntry(key, runtime),
    },
  };
}

export function resolveRuntimeEntry(
  registry: RuntimeRegistrySnapshot,
  key: RuntimeRegistryKey,
): RuntimeRegistryEntry | undefined {
  return registry.entries[key];
}

export function resolveWorkspaceRuntime(registry: RuntimeRegistrySnapshot): WorkspaceRuntime | undefined {
  return registry.entries.workspace?.runtime;
}

export function resolveQuoteRuntime(registry: RuntimeRegistrySnapshot): QuoteRuntime | undefined {
  return registry.entries.quote?.runtime;
}

export function resolveProjectRuntime(registry: RuntimeRegistrySnapshot): ProjectRuntime | undefined {
  return registry.entries.project?.runtime;
}

export function resolveReportRuntime(registry: RuntimeRegistrySnapshot): ReportRuntime | undefined {
  return registry.entries.report?.runtime;
}

export function listRuntimeRegistryEntries(registry: RuntimeRegistrySnapshot): RuntimeRegistryEntry[] {
  return RUNTIME_REGISTRY_KEYS.map((key) => registry.entries[key]);
}

export function listRuntimeRegistryKeys(registry: RuntimeRegistrySnapshot): RuntimeRegistryKey[] {
  return RUNTIME_REGISTRY_KEYS.filter((key) => hasRuntimeEntry(registry, key));
}

export function hasRuntimeEntry(registry: RuntimeRegistrySnapshot, key: RuntimeRegistryKey): boolean {
  return Boolean(registry.entries[key]?.runtime);
}

export function validateRuntimeRegistry(registry: RuntimeRegistrySnapshot): boolean {
  return validateRuntimeRegistrySnapshot(registry);
}

export function describeRuntimeRegistry(registry: RuntimeRegistrySnapshot): string {
  return [
    `workspaceId=${registry.workspaceId}`,
    `version=${registry.version}`,
    `keys=${listRuntimeRegistryKeys(registry).join(",")}`,
  ].join(" ");
}

export function assertRuntimeRegistryHasAllSurfaces(registry: RuntimeRegistrySnapshot): boolean {
  return RUNTIME_REGISTRY_KEYS.every((key) => hasRuntimeEntry(registry, key));
}
