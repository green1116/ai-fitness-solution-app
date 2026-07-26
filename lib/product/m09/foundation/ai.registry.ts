/**
 * Product M09 — AI Foundation capability registry (declaration only)
 */

import {
  AI_CAPABILITY_KINDS,
  AI_CAPABILITY_STATUSES,
  AI_DOMAIN_SCOPES,
  PRODUCT_AI_FOUNDATION_BASE,
} from "./ai.constants";
import type {
  AiCapability,
  AiCapabilityKind,
  AiCapabilityStatus,
  RegisterAiCapabilityInput,
  UpdateAiCapabilityStatusInput,
} from "./ai.types";

const capabilities = new Map<string, AiCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(capability: AiCapability): AiCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerAiCapability(
  input: RegisterAiCapabilityInput,
): AiCapability {
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  const marketplaceBaselineRef = (
    input.marketplaceBaselineRef ?? PRODUCT_AI_FOUNDATION_BASE
  )
    .trim()
    .toLowerCase();

  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (!(AI_CAPABILITY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (!(AI_DOMAIN_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid capability scope: ${input.scope}`);
  }
  if (!marketplaceBaselineRef) {
    throw new Error("capability.marketplaceBaselineRef is required");
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const id = input.id?.trim() || createId("aicap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: AiCapability = {
    id,
    capabilityKey,
    kind: input.kind,
    status: AI_CAPABILITY_STATUSES[0],
    scope: input.scope,
    summary,
    marketplaceBaselineRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  capabilities.set(id, capability);
  keys.set(capabilityKey, id);
  return cloneCapability(capability);
}

export function updateAiCapabilityStatus(
  input: UpdateAiCapabilityStatusInput,
): AiCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (!(AI_CAPABILITY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: AiCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getAiCapability(id: string): AiCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listAiCapabilities(filter?: {
  kind?: AiCapabilityKind;
  status?: AiCapabilityStatus;
}): AiCapability[] {
  let result = [...capabilities.values()];
  if (filter?.kind) {
    result = result.filter((c) => c.kind === filter.kind);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey))
    .map(cloneCapability);
}

export function clearAiCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
