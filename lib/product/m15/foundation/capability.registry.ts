/**
 * Product M15 — Evolution capability in-memory registry
 */

import {
  EVOLUTION_CAPABILITY_KINDS,
  EVOLUTION_CAPABILITY_STATUSES,
} from "./evolution.constants";
import { getEvolutionTrack } from "./evolution.registry";
import type {
  EvolutionCapability,
  EvolutionCapabilityKind,
  EvolutionCapabilityStatus,
  RegisterEvolutionCapabilityInput,
  UpdateEvolutionCapabilityStatusInput,
} from "./evolution.types";

const capabilities = new Map<string, EvolutionCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(capability: EvolutionCapability): EvolutionCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerEvolutionCapability(
  input: RegisterEvolutionCapabilityInput,
): EvolutionCapability {
  const trackId = input.trackId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!trackId) throw new Error("capability.trackId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(EVOLUTION_CAPABILITY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const track = getEvolutionTrack(trackId);
  if (!track) throw new Error(`track not found: ${trackId}`);
  if (track.status !== "ACTIVE" && track.status !== "DRAFT") {
    throw new Error(`track not capable: ${track.trackKey}`);
  }

  const id = input.id?.trim() || createId("evocap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: EvolutionCapability = {
    id,
    trackId,
    capabilityKey,
    kind: input.kind,
    status: EVOLUTION_CAPABILITY_STATUSES[0],
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

export function updateEvolutionCapabilityStatus(
  input: UpdateEvolutionCapabilityStatusInput,
): EvolutionCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(EVOLUTION_CAPABILITY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: EvolutionCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getEvolutionCapability(
  id: string,
): EvolutionCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listEvolutionCapabilities(filter?: {
  trackId?: string;
  kind?: EvolutionCapabilityKind;
  status?: EvolutionCapabilityStatus;
}): EvolutionCapability[] {
  let result = [...capabilities.values()];
  if (filter?.trackId) {
    result = result.filter((c) => c.trackId === filter.trackId);
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

export function clearEvolutionCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
