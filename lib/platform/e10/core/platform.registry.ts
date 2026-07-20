/**
 * E10-P1 — Platform Registry
 * In-memory registry for platform kernel modules
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
  PLATFORM_MODULE_KINDS,
  PLATFORM_MODULE_STATUSES,
} from "./platform.constants";
import type {
  PlatformModule,
  PlatformModuleKind,
  PlatformModuleStatus,
  PlatformRegistryManifest,
  RegisterPlatformModuleInput,
} from "./platform.types";

const modules = new Map<string, PlatformModule>();

function cloneModule(module: PlatformModule): PlatformModule {
  return {
    ...module,
    metadata: { ...module.metadata },
  };
}

function assertKind(kind: string): asserts kind is PlatformModuleKind {
  if (!(PLATFORM_MODULE_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid platform module kind: ${kind}`);
  }
}

function assertStatus(
  status: string,
): asserts status is PlatformModuleStatus {
  if (!(PLATFORM_MODULE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid platform module status: ${status}`);
  }
}

export function registerModule(
  input: RegisterPlatformModuleInput,
): PlatformModule {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("module.id is required");
  if (!name) throw new Error("module.name is required");
  assertKind(input.kind);

  const status = input.status ?? "REGISTERED";
  assertStatus(status);

  if (modules.has(id)) {
    throw new Error(`platform module already registered: ${id}`);
  }

  const version = (input.version ?? E10_PLATFORM_VERSION).trim();
  if (!version) throw new Error("module.version is required");

  const module: PlatformModule = {
    id,
    name,
    kind: input.kind,
    status,
    version,
    metadata: { ...(input.metadata ?? {}) },
  };

  modules.set(id, module);
  return cloneModule(module);
}

export function getModule(id: string): PlatformModule | undefined {
  const module = modules.get(id.trim());
  return module ? cloneModule(module) : undefined;
}

export function listModules(filter?: {
  kind?: PlatformModuleKind;
  status?: PlatformModuleStatus;
}): PlatformModule[] {
  let result = [...modules.values()];
  if (filter?.kind) {
    result = result.filter((m) => m.kind === filter.kind);
  }
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneModule);
}

export function removeModule(id: string): boolean {
  return modules.delete(id.trim());
}

export function updateModuleStatus(
  id: string,
  status: PlatformModuleStatus,
): PlatformModule {
  const module = modules.get(id.trim());
  if (!module) throw new Error(`platform module not found: ${id}`);
  assertStatus(status);
  module.status = status;
  modules.set(module.id, module);
  return cloneModule(module);
}

export function buildPlatformRegistryManifest(): PlatformRegistryManifest {
  const list = listModules();
  return {
    platformId: E10_PLATFORM_ID,
    version: E10_PLATFORM_VERSION,
    freezeVersion: E10_PLATFORM_FREEZE_VERSION,
    base: E10_PLATFORM_BASE,
    moduleCount: list.length,
    modules: list,
  };
}

export function clearModules(): void {
  modules.clear();
}
