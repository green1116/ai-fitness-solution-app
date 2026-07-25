/**
 * Product CRM Audit — Integrity registry
 */

import { getCrmTrail, markCrmTrailStatus } from "../trail/trail.registry";
import type {
  CrmAuditSeal,
  SealCrmTrailInput,
  VerifyCrmSealInput,
} from "./integrity.types";

const seals = new Map<string, CrmAuditSeal>();

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
  return `craud_${hash.toString(16)}`;
}

function cloneSeal(seal: CrmAuditSeal): CrmAuditSeal {
  return { ...seal, metadata: { ...seal.metadata } };
}

export function sealCrmTrail(input: SealCrmTrailInput): CrmAuditSeal {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("integrity.trailId is required");
  const trail = getCrmTrail(trailId);
  if (!trail) throw new Error(`trail not found: ${trailId}`);
  if (trail.status === "SEALED" || trail.status === "EXPORTED") {
    throw new Error(`trail already sealed: ${trailId}`);
  }

  const existing = [...seals.values()].find((s) => s.trailId === trailId);
  if (existing) throw new Error(`seal already exists for trail: ${trailId}`);

  markCrmTrailStatus({ trailId, status: "SEALED" });
  const digest = digestOf(trail.id, trail.sequence, trail.eventId);

  const id = input.id?.trim() || createId("crausel");
  if (seals.has(id)) throw new Error(`seal already exists: ${id}`);

  const seal: CrmAuditSeal = {
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

export function verifyCrmSeal(input: VerifyCrmSealInput): CrmAuditSeal {
  const sealId = input.sealId.trim();
  if (!sealId) throw new Error("integrity.sealId is required");
  const existing = seals.get(sealId);
  if (!existing) throw new Error(`seal not found: ${sealId}`);

  const trail = getCrmTrail(existing.trailId);
  if (!trail) {
    const tampered: CrmAuditSeal = {
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

  const updated: CrmAuditSeal = {
    ...existing,
    result,
    detail: `result=${result} digest=${recomputed}`,
    metadata: { ...existing.metadata },
  };
  seals.set(sealId, updated);
  return cloneSeal(updated);
}

export function getCrmSeal(id: string): CrmAuditSeal | undefined {
  const seal = seals.get(id.trim());
  return seal ? cloneSeal(seal) : undefined;
}

export function listCrmSeals(filter?: {
  trailId?: string;
}): CrmAuditSeal[] {
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

export function clearCrmSeals(): void {
  seals.clear();
}
