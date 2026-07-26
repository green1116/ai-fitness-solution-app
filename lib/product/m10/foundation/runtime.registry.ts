/**
 * Product M10 — AI Runtime Foundation registry (declaration only)
 */

import {
  AI_RUNTIME_CAPABILITY_KINDS,
  AI_RUNTIME_CAPABILITY_STATUSES,
  AI_RUNTIME_DOMAIN_SCOPES,
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
} from "./runtime.constants";
import type {
  AiRuntimeCapability,
  AiRuntimeCapabilityKind,
  AiRuntimeCapabilityStatus,
  RegisterAiRuntimeCapabilityInput,
  UpdateAiRuntimeCapabilityStatusInput,
} from "./runtime.types";

const capabilities = new Map<string, AiRuntimeCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: AiRuntimeCapability,
): AiRuntimeCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerAiRuntimeCapability(
  input: RegisterAiRuntimeCapabilityInput,
): AiRuntimeCapability {
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  const aiBaselineRef = (input.aiBaselineRef ?? PRODUCT_AI_RUNTIME_FOUNDATION_BASE)
    .trim()
    .toLowerCase();

  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(AI_RUNTIME_CAPABILITY_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid runtime capability kind: ${input.kind}`);
  }
  if (!(AI_RUNTIME_DOMAIN_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid runtime capability scope: ${input.scope}`);
  }
  if (!aiBaselineRef) {
    throw new Error("capability.aiBaselineRef is required");
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const id = input.id?.trim() || createId("airtf");
  if (capabilities.has(id)) {
    throw new Error(`runtime capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: AiRuntimeCapability = {
    id,
    capabilityKey,
    kind: input.kind,
    status: AI_RUNTIME_CAPABILITY_STATUSES[0],
    scope: input.scope,
    summary,
    aiBaselineRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  capabilities.set(id, capability);
  keys.set(capabilityKey, id);
  return cloneCapability(capability);
}

export function updateAiRuntimeCapabilityStatus(
  input: UpdateAiRuntimeCapabilityStatusInput,
): AiRuntimeCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(AI_RUNTIME_CAPABILITY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid runtime capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) {
    throw new Error(`runtime capability not found: ${capabilityId}`);
  }

  const updated: AiRuntimeCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getAiRuntimeCapability(
  id: string,
): AiRuntimeCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listAiRuntimeCapabilities(filter?: {
  kind?: AiRuntimeCapabilityKind;
  status?: AiRuntimeCapabilityStatus;
}): AiRuntimeCapability[] {
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

export function clearAiRuntimeCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
