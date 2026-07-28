/**
 * Product M15 — Evolution experience capability in-memory registry
 */

import {
  EVOLUTION_EXPERIENCE_CAPABILITY_KINDS,
  EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES,
} from "./experience.constants";
import { getEvolutionExperience } from "./experience.registry";
import type {
  EvolutionExperienceCapability,
  EvolutionExperienceCapabilityKind,
  EvolutionExperienceCapabilityStatus,
  RegisterEvolutionExperienceCapabilityInput,
  UpdateEvolutionExperienceCapabilityStatusInput,
} from "./experience.types";

const capabilities = new Map<string, EvolutionExperienceCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: EvolutionExperienceCapability,
): EvolutionExperienceCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerEvolutionExperienceCapability(
  input: RegisterEvolutionExperienceCapabilityInput,
): EvolutionExperienceCapability {
  const experienceId = input.experienceId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!experienceId) throw new Error("capability.experienceId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(EVOLUTION_EXPERIENCE_CAPABILITY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const experience = getEvolutionExperience(experienceId);
  if (!experience) throw new Error(`experience not found: ${experienceId}`);
  if (experience.status !== "ACTIVE" && experience.status !== "DRAFT") {
    throw new Error(`experience not capable: ${experience.experienceKey}`);
  }

  const id = input.id?.trim() || createId("evoexcap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: EvolutionExperienceCapability = {
    id,
    experienceId,
    capabilityKey,
    kind: input.kind,
    status: EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES[0],
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

export function updateEvolutionExperienceCapabilityStatus(
  input: UpdateEvolutionExperienceCapabilityStatusInput,
): EvolutionExperienceCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: EvolutionExperienceCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getEvolutionExperienceCapability(
  id: string,
): EvolutionExperienceCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listEvolutionExperienceCapabilities(filter?: {
  experienceId?: string;
  kind?: EvolutionExperienceCapabilityKind;
  status?: EvolutionExperienceCapabilityStatus;
}): EvolutionExperienceCapability[] {
  let result = [...capabilities.values()];
  if (filter?.experienceId) {
    result = result.filter((c) => c.experienceId === filter.experienceId);
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

export function clearEvolutionExperienceCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
