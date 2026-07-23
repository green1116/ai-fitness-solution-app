/**
 * Launch L3 — Runtime status registry
 */

import { RUNTIME_STATUSES } from "./runtime.constants";
import type {
  RegisterRuntimeInput,
  RuntimeNode,
  RuntimeStatus,
  UpdateRuntimeStatusInput,
} from "./runtime.types";

const runtimes = new Map<string, RuntimeNode>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRuntime(runtime: RuntimeNode): RuntimeNode {
  return { ...runtime, metadata: { ...runtime.metadata } };
}

export function registerRuntime(input: RegisterRuntimeInput): RuntimeNode {
  const name = input.name.trim();
  if (!name) throw new Error("runtime.name is required");

  const status: RuntimeStatus = input.status ?? "BOOTING";
  if (!(RUNTIME_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid runtime status: ${status}`);
  }

  const id = input.id?.trim() || createId("l3run");
  if (runtimes.has(id)) {
    throw new Error(`runtime already exists: ${id}`);
  }

  const now = nowIso();
  const runtime: RuntimeNode = {
    id,
    name,
    environment: (input.environment ?? "production").trim() || "production",
    status,
    detail: `status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  runtimes.set(id, runtime);
  return cloneRuntime(runtime);
}

export function updateRuntimeStatus(
  input: UpdateRuntimeStatusInput,
): RuntimeNode {
  const runtimeId = input.runtimeId.trim();
  if (!runtimeId) throw new Error("runtime.runtimeId is required");
  if (!(RUNTIME_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid runtime status: ${input.status}`);
  }

  const current = runtimes.get(runtimeId);
  if (!current) throw new Error(`runtime not found: ${runtimeId}`);

  const note = (input.note ?? "").trim();
  const updated: RuntimeNode = {
    ...current,
    status: input.status,
    detail: note
      ? `status=${input.status} note=${note}`
      : `status=${input.status}`,
    updatedAt: nowIso(),
  };
  runtimes.set(runtimeId, updated);
  return cloneRuntime(updated);
}

export function getRuntime(id: string): RuntimeNode | undefined {
  const runtime = runtimes.get(id.trim());
  return runtime ? cloneRuntime(runtime) : undefined;
}

export function listRuntimes(filter?: {
  status?: RuntimeStatus;
  environment?: string;
}): RuntimeNode[] {
  let result = [...runtimes.values()];
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  if (filter?.environment) {
    const env = filter.environment.trim();
    result = result.filter((r) => r.environment === env);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRuntime);
}

export function clearRuntimes(): void {
  runtimes.clear();
}
