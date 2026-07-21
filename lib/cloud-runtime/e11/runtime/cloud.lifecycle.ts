/**
 * E11-P1 — Cloud Runtime Lifecycle
 * create → register → start | stop | fail → remove
 */

import {
  CLOUD_LIFECYCLE_STAGES,
  CLOUD_LIFECYCLE_TRANSITIONS,
  CLOUD_RUNTIME_KINDS,
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
} from "../core/cloud.constants";
import {
  buildCloudRegistryManifest,
  getRuntime,
  registerRuntime as registryRegisterRuntime,
  removeRuntime as registryRemoveRuntime,
  updateRuntimeStatus,
} from "../registry/cloud.registry";
import type {
  CloudFoundationResult,
  CloudLifecycleStage,
  CloudLifecycleTransition,
  CloudRuntimeInfo,
  CloudRuntimeLifecycle,
  CloudRuntimeRecord,
  RegisterCloudRuntimeInput,
} from "../types/cloud.types";

const lifecycles = new Map<string, CloudRuntimeLifecycle>();

function nowIso(): string {
  return new Date().toISOString();
}

export function getCloudRuntimeInfo(): CloudRuntimeInfo {
  return {
    cloudId: E11_CLOUD_RUNTIME_ID,
    version: E11_CLOUD_RUNTIME_VERSION,
    freezeVersion: E11_CLOUD_RUNTIME_FREEZE_VERSION,
    base: E11_CLOUD_RUNTIME_BASE,
    name: "Enterprise E11 Cloud Runtime Foundation",
    description:
      "Cloud runtime foundation: types, registry, lifecycle, execution context, health",
  };
}

export function canAdvanceCloudLifecycle(
  from: CloudLifecycleStage,
  to: CloudLifecycleStage,
): boolean {
  return CLOUD_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

function appendTransition(
  lifecycle: CloudRuntimeLifecycle,
  to: CloudLifecycleStage,
  note?: string,
): CloudRuntimeLifecycle {
  if (!canAdvanceCloudLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid cloud lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: CloudLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
  };

  return {
    runtimeId: lifecycle.runtimeId,
    current: to,
    stages: [...CLOUD_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
  };
}

function requireLifecycle(runtimeId: string): CloudRuntimeLifecycle {
  const lifecycle = lifecycles.get(runtimeId);
  if (!lifecycle) {
    throw new Error(`lifecycle missing for runtime: ${runtimeId}`);
  }
  return lifecycle;
}

/** Create a runtime shell in created stage (not yet registered). */
export function createRuntime(
  input: RegisterCloudRuntimeInput,
): CloudRuntimeRecord {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("runtime.id is required");
  if (!name) throw new Error("runtime.name is required");
  if (!(CLOUD_RUNTIME_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid cloud runtime kind: ${input.kind}`);
  }
  if (lifecycles.has(id)) {
    throw new Error(`runtime lifecycle already exists: ${id}`);
  }
  if (getRuntime(id)) {
    throw new Error(`runtime already registered: ${id}`);
  }

  const runtime: CloudRuntimeRecord = {
    id,
    name,
    kind: input.kind,
    status: "REGISTERED",
    version: (input.version ?? E11_CLOUD_RUNTIME_VERSION).trim(),
    region: input.region?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };

  lifecycles.set(id, {
    runtimeId: id,
    current: "created",
    stages: [...CLOUD_LIFECYCLE_STAGES],
    transitions: [],
  });

  return { ...runtime, metadata: { ...runtime.metadata } };
}

export function registerCreatedRuntime(
  runtime: CloudRuntimeRecord,
): CloudRuntimeRecord {
  const lifecycle = requireLifecycle(runtime.id);
  if (lifecycle.current !== "created") {
    throw new Error(
      `register requires created (current=${lifecycle.current})`,
    );
  }

  const registered = registryRegisterRuntime({
    id: runtime.id,
    name: runtime.name,
    kind: runtime.kind,
    status: "REGISTERED",
    version: runtime.version,
    region: runtime.region,
    metadata: runtime.metadata,
  });

  lifecycles.set(
    runtime.id,
    appendTransition(lifecycle, "registered", "registered into cloud registry"),
  );
  return registered;
}

export function startRuntime(id: string): CloudRuntimeRecord {
  const lifecycle = requireLifecycle(id.trim());
  if (lifecycle.current !== "registered" && lifecycle.current !== "stopped") {
    throw new Error(
      `start requires registered|stopped (current=${lifecycle.current})`,
    );
  }
  const updated = updateRuntimeStatus(id, "ACTIVE");
  lifecycles.set(id.trim(), appendTransition(lifecycle, "started", "started"));
  return updated;
}

export function stopRuntime(id: string): CloudRuntimeRecord {
  const lifecycle = requireLifecycle(id.trim());
  if (lifecycle.current !== "started" && lifecycle.current !== "failed") {
    throw new Error(
      `stop requires started|failed (current=${lifecycle.current})`,
    );
  }
  const updated = updateRuntimeStatus(id, "STOPPED");
  lifecycles.set(id.trim(), appendTransition(lifecycle, "stopped", "stopped"));
  return updated;
}

export function failRuntime(id: string, note?: string): CloudRuntimeRecord {
  const lifecycle = requireLifecycle(id.trim());
  if (lifecycle.current !== "started") {
    throw new Error(`fail requires started (current=${lifecycle.current})`);
  }
  const updated = updateRuntimeStatus(id, "SUSPENDED");
  lifecycles.set(
    id.trim(),
    appendTransition(lifecycle, "failed", note ?? "runtime failed"),
  );
  return updated;
}

export function removeCreatedRuntime(id: string): boolean {
  const key = id.trim();
  const lifecycle = lifecycles.get(key);
  if (!lifecycle) return false;
  if (
    lifecycle.current !== "registered" &&
    lifecycle.current !== "stopped" &&
    lifecycle.current !== "failed"
  ) {
    throw new Error(
      `remove requires registered|stopped|failed (current=${lifecycle.current})`,
    );
  }

  registryRemoveRuntime(key);
  lifecycles.set(key, appendTransition(lifecycle, "removed", "removed"));
  lifecycles.delete(key);
  return true;
}

export function getRuntimeLifecycle(
  id: string,
): CloudRuntimeLifecycle | undefined {
  const lifecycle = lifecycles.get(id.trim());
  if (!lifecycle) return undefined;
  return {
    ...lifecycle,
    stages: [...lifecycle.stages],
    transitions: lifecycle.transitions.map((t) => ({ ...t })),
  };
}

export function clearLifecycles(): void {
  lifecycles.clear();
}

export function buildCloudFoundation(): CloudFoundationResult {
  const info = getCloudRuntimeInfo();
  const registry = buildCloudRegistryManifest();
  const ready =
    info.cloudId === E11_CLOUD_RUNTIME_ID &&
    info.version === E11_CLOUD_RUNTIME_VERSION &&
    info.base === E11_CLOUD_RUNTIME_BASE;

  return {
    cloudId: E11_CLOUD_RUNTIME_ID,
    version: E11_CLOUD_RUNTIME_VERSION,
    freezeVersion: E11_CLOUD_RUNTIME_FREEZE_VERSION,
    base: E11_CLOUD_RUNTIME_BASE,
    registry,
    ready,
    summary: [
      `e11-cloud-foundation ready=${ready}`,
      `cloud=${E11_CLOUD_RUNTIME_ID}`,
      `base=${E11_CLOUD_RUNTIME_BASE}`,
      `runtimes=${registry.runtimeCount}`,
    ].join(" "),
  };
}
