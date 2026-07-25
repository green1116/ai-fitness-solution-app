/**
 * Product Audit — Integrity registry
 */

import { getTrail, markTrailStatus } from "../trail/trail.registry";
import type {
  AuditSeal,
  SealTrailInput,
  VerifySealInput,
} from "./integrity.types";

const seals = new Map<string, AuditSeal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function digestOf(trailId: string, sequence: number, eventId: string): string {
  const raw = `${trailId}:${sequence}:${eventId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `aud_${hash.toString(16)}`;
}

function cloneSeal(seal: AuditSeal): AuditSeal {
  return { ...seal, metadata: { ...seal.metadata } };
}

export function sealTrail(input: SealTrailInput): AuditSeal {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("integrity.trailId is required");
  const trail = getTrail(trailId);
  if (!trail) throw new Error(`trail not found: ${trailId}`);
  if (trail.status === "SEALED" || trail.status === "EXPORTED") {
    throw new Error(`trail already sealed: ${trailId}`);
  }

  const existing = [...seals.values()].find((s) => s.trailId === trailId);
  if (existing) throw new Error(`seal already exists for trail: ${trailId}`);

  markTrailStatus({ trailId, status: "SEALED" });
  const digest = digestOf(trail.id, trail.sequence, trail.eventId);

  const id = input.id?.trim() || createId("audsel");
  if (seals.has(id)) throw new Error(`seal already exists: ${id}`);

  const seal: AuditSeal = {
    id,
    trailId,
    digest,
    result: "INTACT",
    detail: `trail=${trailId} digest=${digest}`,
    metadata: { ...(input.metadata ?? {}) },
    sealedAt: nowIso(),
  };
  seals.set(id, seal);
  return cloneSeal(seal);
}

export function verifySeal(input: VerifySealInput): AuditSeal {
  const sealId = input.sealId.trim();
  if (!sealId) throw new Error("integrity.sealId is required");
  const existing = seals.get(sealId);
  if (!existing) throw new Error(`seal not found: ${sealId}`);

  const trail = getTrail(existing.trailId);
  if (!trail) {
    const tampered: AuditSeal = {
      ...existing,
      result: "TAMPERED",
      detail: `trail missing: ${existing.trailId}`,
      metadata: { ...existing.metadata },
    };
    seals.set(sealId, tampered);
    return cloneSeal(tampered);
  }

  const recomputed = digestOf(trail.id, trail.sequence, trail.eventId);
  const expected = (input.expectedDigest ?? existing.digest).trim();
  const result = recomputed === expected ? "INTACT" : "TAMPERED";

  const updated: AuditSeal = {
    ...existing,
    result,
    detail: `result=${result} digest=${recomputed}`,
    metadata: { ...existing.metadata },
  };
  seals.set(sealId, updated);
  return cloneSeal(updated);
}

export function getSeal(id: string): AuditSeal | undefined {
  const seal = seals.get(id.trim());
  return seal ? cloneSeal(seal) : undefined;
}

export function listSeals(filter?: {
  trailId?: string;
}): AuditSeal[] {
  let result = [...seals.values()];
  if (filter?.trailId) {
    const trailId = filter.trailId.trim();
    result = result.filter((s) => s.trailId === trailId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSeal);
}

export function clearSeals(): void {
  seals.clear();
}
