/**
 * Product M14 — Intelligence capability in-memory registry
 */

import {
  INTELLIGENCE_CAPABILITY_KINDS,
  INTELLIGENCE_CAPABILITY_STATUSES,
} from "./intelligence.constants";
import { getIntelligenceLens } from "./intelligence.registry";
import type {
  IntelligenceCapability,
  IntelligenceCapabilityKind,
  IntelligenceCapabilityStatus,
  RegisterIntelligenceCapabilityInput,
  UpdateIntelligenceCapabilityStatusInput,
} from "./intelligence.types";

const capabilities = new Map<string, IntelligenceCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: IntelligenceCapability,
): IntelligenceCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerIntelligenceCapability(
  input: RegisterIntelligenceCapabilityInput,
): IntelligenceCapability {
  const lensId = input.lensId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!lensId) throw new Error("capability.lensId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(INTELLIGENCE_CAPABILITY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const lens = getIntelligenceLens(lensId);
  if (!lens) throw new Error(`lens not found: ${lensId}`);
  if (lens.status !== "ACTIVE" && lens.status !== "DRAFT") {
    throw new Error(`lens not capable: ${lens.lensKey}`);
  }

  const id = input.id?.trim() || createId("intcap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: IntelligenceCapability = {
    id,
    lensId,
    capabilityKey,
    kind: input.kind,
    status: INTELLIGENCE_CAPABILITY_STATUSES[0],
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

export function updateIntelligenceCapabilityStatus(
  input: UpdateIntelligenceCapabilityStatusInput,
): IntelligenceCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(INTELLIGENCE_CAPABILITY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: IntelligenceCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getIntelligenceCapability(
  id: string,
): IntelligenceCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listIntelligenceCapabilities(filter?: {
  lensId?: string;
  kind?: IntelligenceCapabilityKind;
  status?: IntelligenceCapabilityStatus;
}): IntelligenceCapability[] {
  let result = [...capabilities.values()];
  if (filter?.lensId) {
    result = result.filter((c) => c.lensId === filter.lensId);
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

export function clearIntelligenceCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
