/**
 * Product M13 — OS capability in-memory registry
 */

import { OS_CAPABILITY_KINDS, OS_CAPABILITY_STATUSES } from "./os.constants";
import { getOsSurface } from "./os.registry";
import type {
  OsCapability,
  OsCapabilityKind,
  OsCapabilityStatus,
  RegisterOsCapabilityInput,
  UpdateOsCapabilityStatusInput,
} from "./os.types";

const capabilities = new Map<string, OsCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(capability: OsCapability): OsCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerOsCapability(
  input: RegisterOsCapabilityInput,
): OsCapability {
  const surfaceId = input.surfaceId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!surfaceId) throw new Error("capability.surfaceId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (!(OS_CAPABILITY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const surface = getOsSurface(surfaceId);
  if (!surface) throw new Error(`surface not found: ${surfaceId}`);
  if (surface.status !== "ACTIVE" && surface.status !== "DRAFT") {
    throw new Error(`surface not capable: ${surface.surfaceKey}`);
  }

  const id = input.id?.trim() || createId("oscap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: OsCapability = {
    id,
    surfaceId,
    capabilityKey,
    kind: input.kind,
    status: OS_CAPABILITY_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  capabilities.set(id, capability);
  keys.set(capabilityKey, id);
  return cloneCapability(capability);
}

export function updateOsCapabilityStatus(
  input: UpdateOsCapabilityStatusInput,
): OsCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(OS_CAPABILITY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: OsCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getOsCapability(id: string): OsCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listOsCapabilities(filter?: {
  surfaceId?: string;
  kind?: OsCapabilityKind;
  status?: OsCapabilityStatus;
}): OsCapability[] {
  let result = [...capabilities.values()];
  if (filter?.surfaceId) {
    result = result.filter((c) => c.surfaceId === filter.surfaceId);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey))
    .map(cloneCapability);
}

export function clearOsCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
