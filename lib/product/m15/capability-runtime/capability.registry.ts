/**
 * Product M15 â€?Evolution capability spec in-memory registry
 */

import {
  EVOLUTION_CAPABILITY_SPEC_STATUSES,
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
} from "./capability.constants";
import { validateEvolutionCapabilitySpecInput } from "./capability.metadata";
import type {
  EvolutionCapabilitySpec,
  EvolutionCapabilitySpecKind,
  EvolutionCapabilitySpecStatus,
  RegisterEvolutionCapabilitySpecInput,
  UpdateEvolutionCapabilitySpecStatusInput,
} from "./capability.types";

const capabilities = new Map<string, EvolutionCapabilitySpec>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: EvolutionCapabilitySpec,
): EvolutionCapabilitySpec {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerEvolutionCapabilitySpec(
  input: RegisterEvolutionCapabilitySpecInput,
): EvolutionCapabilitySpec {
  const validation = validateEvolutionCapabilitySpecInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid evolution capability: ${first?.field} ${first?.message}`,
    );
  }

  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const optimizationRef = (
    input.optimizationRef ?? PRODUCT_EVOLUTION_CAPABILITY_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const id = input.id?.trim() || createId("evocapspec");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: EvolutionCapabilitySpec = {
    id,
    capabilityKey,
    kind: input.kind,
    status: EVOLUTION_CAPABILITY_SPEC_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    optimizationRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  capabilities.set(id, capability);
  keys.set(capabilityKey, id);
  return cloneCapability(capability);
}

export function updateEvolutionCapabilitySpecStatus(
  input: UpdateEvolutionCapabilitySpecStatusInput,
): EvolutionCapabilitySpec {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(EVOLUTION_CAPABILITY_SPEC_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: EvolutionCapabilitySpec = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getEvolutionCapabilitySpec(
  id: string,
): EvolutionCapabilitySpec | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function getEvolutionCapabilitySpecByKey(
  capabilityKey: string,
): EvolutionCapabilitySpec | undefined {
  const id = keys.get(capabilityKey.trim().toUpperCase());
  return id ? getEvolutionCapabilitySpec(id) : undefined;
}

export function listEvolutionCapabilitySpecs(filter?: {
  kind?: EvolutionCapabilitySpecKind;
  status?: EvolutionCapabilitySpecStatus;
}): EvolutionCapabilitySpec[] {
  let result = [...capabilities.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey))
    .map(cloneCapability);
}

export function clearEvolutionCapabilitySpecs(): void {
  capabilities.clear();
  keys.clear();
}
