/**
 * Product P7 — Collaboration registry
 */

import { COLLABORATION_STATUSES } from "./collaboration.constants";
import type {
  CollaborationStatus,
  CollaborationThread,
  CreateCollaborationInput,
  UpdateCollaborationStatusInput,
} from "./collaboration.types";

const collaborations = new Map<string, CollaborationThread>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCollaboration(
  thread: CollaborationThread,
): CollaborationThread {
  return { ...thread, metadata: { ...thread.metadata } };
}

export function createCollaboration(
  input: CreateCollaborationInput,
): CollaborationThread {
  const budgetRef = input.budgetRef.trim();
  const title = input.title.trim();
  const owner = input.owner.trim();
  if (!budgetRef) throw new Error("collaboration.budgetRef is required");
  if (!title) throw new Error("collaboration.title is required");
  if (!owner) throw new Error("collaboration.owner is required");

  const id = input.id?.trim() || createId("p7col");
  if (collaborations.has(id)) {
    throw new Error(`collaboration already exists: ${id}`);
  }

  const now = nowIso();
  const status = COLLABORATION_STATUSES[0];
  const thread: CollaborationThread = {
    id,
    budgetRef,
    title,
    owner,
    status,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  collaborations.set(id, thread);
  return cloneCollaboration(thread);
}

export function updateCollaborationStatus(
  input: UpdateCollaborationStatusInput,
): CollaborationThread {
  const collaborationId = input.collaborationId.trim();
  if (!collaborationId) {
    throw new Error("collaboration.collaborationId is required");
  }
  if (!(COLLABORATION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid collaboration status: ${input.status}`);
  }
  const existing = collaborations.get(collaborationId);
  if (!existing) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const updated: CollaborationThread = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  collaborations.set(collaborationId, updated);
  return cloneCollaboration(updated);
}

export function getCollaboration(
  id: string,
): CollaborationThread | undefined {
  const thread = collaborations.get(id.trim());
  return thread ? cloneCollaboration(thread) : undefined;
}

export function listCollaborations(filter?: {
  budgetRef?: string;
  status?: CollaborationStatus;
}): CollaborationThread[] {
  let result = [...collaborations.values()];
  if (filter?.budgetRef) {
    const bref = filter.budgetRef.trim();
    result = result.filter((c) => c.budgetRef === bref);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCollaboration);
}

export function clearCollaborations(): void {
  collaborations.clear();
}
