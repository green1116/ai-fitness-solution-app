/**
 * Product M15 — Evolution capability revision in-memory registry
 */

import {
  EVOLUTION_CAPABILITY_REVISION_KINDS,
  EVOLUTION_CAPABILITY_REVISION_STATUSES,
} from "./capability.constants";
import { getEvolutionCapabilitySpec } from "./capability.registry";
import type {
  EvolutionCapabilityRevision,
  EvolutionCapabilityRevisionKind,
  EvolutionCapabilityRevisionStatus,
  RegisterEvolutionCapabilityRevisionInput,
  UpdateEvolutionCapabilityRevisionStatusInput,
} from "./capability.types";

const revisions = new Map<string, EvolutionCapabilityRevision>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRevision(
  revision: EvolutionCapabilityRevision,
): EvolutionCapabilityRevision {
  return { ...revision, metadata: { ...revision.metadata } };
}

export function registerEvolutionCapabilityRevision(
  input: RegisterEvolutionCapabilityRevisionInput,
): EvolutionCapabilityRevision {
  const capabilityId = input.capabilityId.trim();
  const revisionKey = input.revisionKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!capabilityId) throw new Error("revision.capabilityId is required");
  if (!revisionKey) throw new Error("revision.revisionKey is required");
  if (!summary) throw new Error("revision.summary is required");
  if (
    !(EVOLUTION_CAPABILITY_REVISION_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid revision kind: ${input.kind}`);
  }
  if (keys.has(revisionKey)) {
    throw new Error(`revisionKey already exists: ${revisionKey}`);
  }

  const capability = getEvolutionCapabilitySpec(capabilityId);
  if (!capability) throw new Error(`capability not found: ${capabilityId}`);
  if (capability.status !== "ACTIVE" && capability.status !== "DRAFT") {
    throw new Error(`capability not revisable: ${capability.capabilityKey}`);
  }

  const id = input.id?.trim() || createId("evocaprev");
  if (revisions.has(id)) {
    throw new Error(`revision already exists: ${id}`);
  }

  const now = nowIso();
  const revision: EvolutionCapabilityRevision = {
    id,
    capabilityId,
    revisionKey,
    kind: input.kind,
    status: EVOLUTION_CAPABILITY_REVISION_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  revisions.set(id, revision);
  keys.set(revisionKey, id);
  return cloneRevision(revision);
}

export function updateEvolutionCapabilityRevisionStatus(
  input: UpdateEvolutionCapabilityRevisionStatusInput,
): EvolutionCapabilityRevision {
  const revisionId = input.revisionId.trim();
  if (!revisionId) throw new Error("revision.revisionId is required");
  if (
    !(EVOLUTION_CAPABILITY_REVISION_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid revision status: ${input.status}`);
  }

  const existing = revisions.get(revisionId);
  if (!existing) throw new Error(`revision not found: ${revisionId}`);

  const updated: EvolutionCapabilityRevision = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  revisions.set(revisionId, updated);
  return cloneRevision(updated);
}

export function getEvolutionCapabilityRevision(
  id: string,
): EvolutionCapabilityRevision | undefined {
  const revision = revisions.get(id.trim());
  return revision ? cloneRevision(revision) : undefined;
}

export function listEvolutionCapabilityRevisions(filter?: {
  capabilityId?: string;
  kind?: EvolutionCapabilityRevisionKind;
  status?: EvolutionCapabilityRevisionStatus;
}): EvolutionCapabilityRevision[] {
  let result = [...revisions.values()];
  if (filter?.capabilityId) {
    result = result.filter((r) => r.capabilityId === filter.capabilityId);
  }
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.revisionKey.localeCompare(b.revisionKey))
    .map(cloneRevision);
}

export function clearEvolutionCapabilityRevisions(): void {
  revisions.clear();
  keys.clear();
}
