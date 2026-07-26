/**
 * Product M10 — AI Runtime Audit integrity registry (seal record only)
 */

import type {
  AiRuntimeAuditSeal,
  SealAiRuntimeAuditTrailInput,
  VerifyAiRuntimeAuditSealInput,
} from "./audit.types";
import {
  getAiRuntimeAuditTrail,
  markAiRuntimeAuditTrailStatus,
} from "./trail.registry";

const seals = new Map<string, AiRuntimeAuditSeal>();

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
  return `airta_${hash.toString(16)}`;
}

function cloneSeal(seal: AiRuntimeAuditSeal): AiRuntimeAuditSeal {
  return { ...seal, metadata: { ...seal.metadata } };
}

export function sealAiRuntimeAuditTrail(
  input: SealAiRuntimeAuditTrailInput,
): AiRuntimeAuditSeal {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("integrity.trailId is required");
  const trail = getAiRuntimeAuditTrail(trailId);
  if (!trail) throw new Error(`trail not found: ${trailId}`);
  if (trail.status === "SEALED" || trail.status === "EXPORTED") {
    throw new Error(`trail already sealed: ${trailId}`);
  }

  const existing = [...seals.values()].find((s) => s.trailId === trailId);
  if (existing) throw new Error(`seal already exists for trail: ${trailId}`);

  markAiRuntimeAuditTrailStatus({ trailId, status: "SEALED" });
  const digest = digestOf(trail.id, trail.sequence, trail.eventId);

  const id = input.id?.trim() || createId("airtasel");
  if (seals.has(id)) throw new Error(`seal already exists: ${id}`);

  const seal: AiRuntimeAuditSeal = {
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

export function verifyAiRuntimeAuditSeal(
  input: VerifyAiRuntimeAuditSealInput,
): AiRuntimeAuditSeal {
  const sealId = input.sealId.trim();
  if (!sealId) throw new Error("integrity.sealId is required");
  const existing = seals.get(sealId);
  if (!existing) throw new Error(`seal not found: ${sealId}`);

  const trail = getAiRuntimeAuditTrail(existing.trailId);
  if (!trail) {
    const tampered: AiRuntimeAuditSeal = {
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

  const updated: AiRuntimeAuditSeal = {
    ...existing,
    result,
    detail: `result=${result} digest=${recomputed}`,
    metadata: { ...existing.metadata },
  };
  seals.set(sealId, updated);
  return cloneSeal(updated);
}

export function getAiRuntimeAuditSeal(
  id: string,
): AiRuntimeAuditSeal | undefined {
  const seal = seals.get(id.trim());
  return seal ? cloneSeal(seal) : undefined;
}

export function listAiRuntimeAuditSeals(filter?: {
  trailId?: string;
}): AiRuntimeAuditSeal[] {
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

export function clearAiRuntimeAuditSeals(): void {
  seals.clear();
}
