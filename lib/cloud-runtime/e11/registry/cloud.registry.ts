/**
 * E11-P1 — Cloud Runtime Registry
 * In-memory registry for cloud runtime instances
 */

import {
  CLOUD_RUNTIME_KINDS,
  CLOUD_RUNTIME_STATUSES,
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
} from "../core/cloud.constants";
import type {
  CloudRegistryManifest,
  CloudRuntimeKind,
  CloudRuntimeRecord,
  CloudRuntimeStatus,
  RegisterCloudRuntimeInput,
} from "../types/cloud.types";

const runtimes = new Map<string, CloudRuntimeRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneRuntime(runtime: CloudRuntimeRecord): CloudRuntimeRecord {
  return {
    ...runtime,
    metadata: { ...runtime.metadata },
  };
}

function assertKind(kind: string): asserts kind is CloudRuntimeKind {
  if (!(CLOUD_RUNTIME_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid cloud runtime kind: ${kind}`);
  }
}

function assertStatus(
  status: string,
): asserts status is CloudRuntimeStatus {
  if (!(CLOUD_RUNTIME_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid cloud runtime status: ${status}`);
  }
}

export function registerRuntime(
  input: RegisterCloudRuntimeInput,
): CloudRuntimeRecord {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("runtime.id is required");
  if (!name) throw new Error("runtime.name is required");
  assertKind(input.kind);

  const status = input.status ?? "REGISTERED";
  assertStatus(status);

  if (runtimes.has(id)) {
    throw new Error(`cloud runtime already registered: ${id}`);
  }

  const version = (input.version ?? E11_CLOUD_RUNTIME_VERSION).trim();
  if (!version) throw new Error("runtime.version is required");

  const runtime: CloudRuntimeRecord = {
    id,
    name,
    kind: input.kind,
    status,
    version,
    region: input.region?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };

  runtimes.set(id, runtime);
  return cloneRuntime(runtime);
}

export function getRuntime(id: string): CloudRuntimeRecord | undefined {
  const runtime = runtimes.get(id.trim());
  return runtime ? cloneRuntime(runtime) : undefined;
}

export function listRuntimes(filter?: {
  kind?: CloudRuntimeKind;
  status?: CloudRuntimeStatus;
  region?: string;
}): CloudRuntimeRecord[] {
  let result = [...runtimes.values()];
  if (filter?.kind) {
    result = result.filter((r) => r.kind === filter.kind);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  if (filter?.region) {
    const region = filter.region.trim();
    result = result.filter((r) => r.region === region);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRuntime);
}

export function removeRuntime(id: string): boolean {
  return runtimes.delete(id.trim());
}

export function updateRuntimeStatus(
  id: string,
  status: CloudRuntimeStatus,
): CloudRuntimeRecord {
  const runtime = runtimes.get(id.trim());
  if (!runtime) throw new Error(`cloud runtime not found: ${id}`);
  assertStatus(status);
  runtime.status = status;
  runtimes.set(runtime.id, runtime);
  return cloneRuntime(runtime);
}

export function buildCloudRegistryManifest(): CloudRegistryManifest {
  const list = listRuntimes();
  return {
    cloudId: E11_CLOUD_RUNTIME_ID,
    version: E11_CLOUD_RUNTIME_VERSION,
    freezeVersion: E11_CLOUD_RUNTIME_FREEZE_VERSION,
    base: E11_CLOUD_RUNTIME_BASE,
    runtimeCount: list.length,
    runtimes: list,
  };
}

export function clearRuntimes(): void {
  runtimes.clear();
}
