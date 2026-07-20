/**
 * E10-P1 — Platform Lifecycle
 * create → register → activate | suspend → remove
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
  PLATFORM_LIFECYCLE_STAGES,
  PLATFORM_LIFECYCLE_TRANSITIONS,
  PLATFORM_MODULE_KINDS,
} from "./platform.constants";
import {
  buildPlatformRegistryManifest,
  getModule,
  registerModule as registryRegisterModule,
  removeModule as registryRemoveModule,
  updateModuleStatus,
} from "./platform.registry";
import type {
  PlatformFoundationResult,
  PlatformInfo,
  PlatformLifecycleStage,
  PlatformLifecycleTransition,
  PlatformModule,
  PlatformModuleLifecycle,
  RegisterPlatformModuleInput,
} from "./platform.types";

const lifecycles = new Map<string, PlatformModuleLifecycle>();

function nowIso(): string {
  return new Date().toISOString();
}

export function getPlatformInfo(): PlatformInfo {
  return {
    platformId: E10_PLATFORM_ID,
    version: E10_PLATFORM_VERSION,
    freezeVersion: E10_PLATFORM_FREEZE_VERSION,
    base: E10_PLATFORM_BASE,
    name: "Enterprise E10 Platform Kernel",
    description:
      "Platform foundation kernel: metadata, registry, lifecycle, runtime stub",
  };
}

export function canAdvancePlatformLifecycle(
  from: PlatformLifecycleStage,
  to: PlatformLifecycleStage,
): boolean {
  return PLATFORM_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

function appendTransition(
  lifecycle: PlatformModuleLifecycle,
  to: PlatformLifecycleStage,
  note?: string,
): PlatformModuleLifecycle {
  if (!canAdvancePlatformLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid platform lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: PlatformLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
  };

  return {
    moduleId: lifecycle.moduleId,
    current: to,
    stages: [...PLATFORM_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
  };
}

function requireLifecycle(moduleId: string): PlatformModuleLifecycle {
  const lifecycle = lifecycles.get(moduleId);
  if (!lifecycle) {
    throw new Error(`lifecycle missing for module: ${moduleId}`);
  }
  return lifecycle;
}

/** Create a module shell in created stage (not yet registered). */
export function createModule(
  input: RegisterPlatformModuleInput,
): PlatformModule {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("module.id is required");
  if (!name) throw new Error("module.name is required");
  if (!(PLATFORM_MODULE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid platform module kind: ${input.kind}`);
  }
  if (lifecycles.has(id)) {
    throw new Error(`module lifecycle already exists: ${id}`);
  }
  if (getModule(id)) {
    throw new Error(`module already registered: ${id}`);
  }

  const module: PlatformModule = {
    id,
    name,
    kind: input.kind,
    status: "REGISTERED",
    version: (input.version ?? E10_PLATFORM_VERSION).trim(),
    metadata: { ...(input.metadata ?? {}) },
  };

  lifecycles.set(id, {
    moduleId: id,
    current: "created",
    stages: [...PLATFORM_LIFECYCLE_STAGES],
    transitions: [],
  });

  return {
    ...module,
    metadata: { ...module.metadata },
  };
}

/** Register a created module into the platform registry. */
export function registerCreatedModule(module: PlatformModule): PlatformModule {
  const lifecycle = requireLifecycle(module.id);
  if (lifecycle.current !== "created") {
    throw new Error(
      `registerCreatedModule requires created stage (current=${lifecycle.current})`,
    );
  }

  const registered = registryRegisterModule({
    id: module.id,
    name: module.name,
    kind: module.kind,
    status: "REGISTERED",
    version: module.version,
    metadata: module.metadata,
  });

  lifecycles.set(
    module.id,
    appendTransition(lifecycle, "registered", "module registered"),
  );

  return registered;
}

/** Activate a registered or suspended module. */
export function activateModule(id: string): PlatformModule {
  const lifecycle = requireLifecycle(id);
  const next =
    lifecycle.current === "registered" || lifecycle.current === "suspended"
      ? "activated"
      : null;
  if (!next) {
    throw new Error(
      `activateModule invalid from stage: ${lifecycle.current}`,
    );
  }

  const updated = updateModuleStatus(id, "ACTIVE");
  lifecycles.set(id, appendTransition(lifecycle, next, "module activated"));
  return updated;
}

/** Suspend an active module. */
export function suspendModule(id: string): PlatformModule {
  const lifecycle = requireLifecycle(id);
  if (lifecycle.current !== "activated") {
    throw new Error(
      `suspendModule requires activated stage (current=${lifecycle.current})`,
    );
  }

  const updated = updateModuleStatus(id, "SUSPENDED");
  lifecycles.set(
    id,
    appendTransition(lifecycle, "suspended", "module suspended"),
  );
  return updated;
}

/** Remove a module from registry and close its lifecycle. */
export function removeCreatedModule(id: string): boolean {
  const lifecycle = requireLifecycle(id);
  if (
    lifecycle.current !== "registered" &&
    lifecycle.current !== "activated" &&
    lifecycle.current !== "suspended"
  ) {
    throw new Error(
      `removeCreatedModule invalid from stage: ${lifecycle.current}`,
    );
  }

  const removed = registryRemoveModule(id);
  if (!removed) {
    throw new Error(`module not found in registry: ${id}`);
  }

  lifecycles.set(
    id,
    appendTransition(lifecycle, "removed", "module removed"),
  );
  return true;
}

export function getModuleLifecycle(
  moduleId: string,
): PlatformModuleLifecycle | undefined {
  const lifecycle = lifecycles.get(moduleId.trim());
  if (!lifecycle) return undefined;
  return {
    ...lifecycle,
    stages: [...lifecycle.stages],
    transitions: [...lifecycle.transitions],
  };
}

export function clearLifecycles(): void {
  lifecycles.clear();
}

export function buildPlatformFoundation(): PlatformFoundationResult {
  const registry = buildPlatformRegistryManifest();
  const info = getPlatformInfo();
  const ready =
    info.platformId === E10_PLATFORM_ID &&
    info.version === E10_PLATFORM_VERSION &&
    info.base === E10_PLATFORM_BASE;

  return {
    platformId: E10_PLATFORM_ID,
    version: E10_PLATFORM_VERSION,
    freezeVersion: E10_PLATFORM_FREEZE_VERSION,
    base: E10_PLATFORM_BASE,
    registry,
    ready,
    summary: [
      `e10-platform-foundation ready=${ready}`,
      `platform=${E10_PLATFORM_ID}`,
      `base=${E10_PLATFORM_BASE}`,
      `modules=${registry.moduleCount}`,
      `freeze=${E10_PLATFORM_FREEZE_VERSION}`,
    ].join(" "),
  };
}
