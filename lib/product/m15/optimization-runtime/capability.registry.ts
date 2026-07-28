/**
 * Product M15 — Evolution optimization capability in-memory registry
 */

import {
  EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS,
  EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES,
} from "./optimization.constants";
import { getEvolutionOptimizationProposal } from "./optimization.registry";
import type {
  EvolutionOptimizationCapability,
  EvolutionOptimizationCapabilityKind,
  EvolutionOptimizationCapabilityStatus,
  RegisterEvolutionOptimizationCapabilityInput,
  UpdateEvolutionOptimizationCapabilityStatusInput,
} from "./optimization.types";

const capabilities = new Map<string, EvolutionOptimizationCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: EvolutionOptimizationCapability,
): EvolutionOptimizationCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerEvolutionOptimizationCapability(
  input: RegisterEvolutionOptimizationCapabilityInput,
): EvolutionOptimizationCapability {
  const proposalId = input.proposalId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!proposalId) throw new Error("capability.proposalId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const proposal = getEvolutionOptimizationProposal(proposalId);
  if (!proposal) throw new Error(`proposal not found: ${proposalId}`);
  if (proposal.status !== "ACTIVE" && proposal.status !== "DRAFT") {
    throw new Error(`proposal not capable: ${proposal.proposalKey}`);
  }

  const id = input.id?.trim() || createId("evoptcap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: EvolutionOptimizationCapability = {
    id,
    proposalId,
    capabilityKey,
    kind: input.kind,
    status: EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES[0],
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

export function updateEvolutionOptimizationCapabilityStatus(
  input: UpdateEvolutionOptimizationCapabilityStatusInput,
): EvolutionOptimizationCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: EvolutionOptimizationCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getEvolutionOptimizationCapability(
  id: string,
): EvolutionOptimizationCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listEvolutionOptimizationCapabilities(filter?: {
  proposalId?: string;
  kind?: EvolutionOptimizationCapabilityKind;
  status?: EvolutionOptimizationCapabilityStatus;
}): EvolutionOptimizationCapability[] {
  let result = [...capabilities.values()];
  if (filter?.proposalId) {
    result = result.filter((c) => c.proposalId === filter.proposalId);
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

export function clearEvolutionOptimizationCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
