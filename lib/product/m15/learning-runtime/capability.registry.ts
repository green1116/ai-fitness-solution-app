/**
 * Product M15 — Evolution learning capability in-memory registry
 */

import {
  EVOLUTION_LEARNING_CAPABILITY_KINDS,
  EVOLUTION_LEARNING_CAPABILITY_STATUSES,
} from "./learning.constants";
import { getEvolutionLearning } from "./learning.registry";
import type {
  EvolutionLearningCapability,
  EvolutionLearningCapabilityKind,
  EvolutionLearningCapabilityStatus,
  RegisterEvolutionLearningCapabilityInput,
  UpdateEvolutionLearningCapabilityStatusInput,
} from "./learning.types";

const capabilities = new Map<string, EvolutionLearningCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: EvolutionLearningCapability,
): EvolutionLearningCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerEvolutionLearningCapability(
  input: RegisterEvolutionLearningCapabilityInput,
): EvolutionLearningCapability {
  const learningId = input.learningId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!learningId) throw new Error("capability.learningId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(EVOLUTION_LEARNING_CAPABILITY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const learning = getEvolutionLearning(learningId);
  if (!learning) throw new Error(`learning not found: ${learningId}`);
  if (learning.status !== "ACTIVE" && learning.status !== "DRAFT") {
    throw new Error(`learning not capable: ${learning.learningKey}`);
  }

  const id = input.id?.trim() || createId("evolrncap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: EvolutionLearningCapability = {
    id,
    learningId,
    capabilityKey,
    kind: input.kind,
    status: EVOLUTION_LEARNING_CAPABILITY_STATUSES[0],
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

export function updateEvolutionLearningCapabilityStatus(
  input: UpdateEvolutionLearningCapabilityStatusInput,
): EvolutionLearningCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(EVOLUTION_LEARNING_CAPABILITY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: EvolutionLearningCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getEvolutionLearningCapability(
  id: string,
): EvolutionLearningCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listEvolutionLearningCapabilities(filter?: {
  learningId?: string;
  kind?: EvolutionLearningCapabilityKind;
  status?: EvolutionLearningCapabilityStatus;
}): EvolutionLearningCapability[] {
  let result = [...capabilities.values()];
  if (filter?.learningId) {
    result = result.filter((c) => c.learningId === filter.learningId);
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

export function clearEvolutionLearningCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
