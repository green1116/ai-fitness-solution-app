/**
 * Product M11 — Knowledge compatibility pair registry (soft policyKeyRef)
 */

import {
  KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES,
  KNOWLEDGE_COMPATIBILITY_RELATIONS,
} from "./compatibility.constants";
import { getKnowledgeCompatibilityMatrix } from "./matrix.registry";
import type {
  KnowledgeCompatibilityPair,
  KnowledgeCompatibilityPairStatus,
  RegisterKnowledgeCompatibilityPairInput,
  UpdateKnowledgeCompatibilityPairStatusInput,
} from "./compatibility.types";

const pairs = new Map<string, KnowledgeCompatibilityPair>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePair(
  pair: KnowledgeCompatibilityPair,
): KnowledgeCompatibilityPair {
  return { ...pair, metadata: { ...pair.metadata } };
}

export function registerKnowledgeCompatibilityPair(
  input: RegisterKnowledgeCompatibilityPairInput,
): KnowledgeCompatibilityPair {
  const matrixId = input.matrixId.trim();
  const pairKey = input.pairKey.trim().toUpperCase();
  const upstreamVersionRef = input.upstreamVersionRef.trim().toLowerCase();
  const downstreamVersionRef = input.downstreamVersionRef.trim().toLowerCase();
  const policyKeyRef = input.policyKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!matrixId) throw new Error("pair.matrixId is required");
  if (!pairKey) throw new Error("pair.pairKey is required");
  if (!upstreamVersionRef) {
    throw new Error("pair.upstreamVersionRef is required");
  }
  if (!downstreamVersionRef) {
    throw new Error("pair.downstreamVersionRef is required");
  }
  if (!policyKeyRef) throw new Error("pair.policyKeyRef is required");
  if (!summary) throw new Error("pair.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("pair.sequence must be a positive integer");
  }
  if (
    !(KNOWLEDGE_COMPATIBILITY_RELATIONS as readonly string[]).includes(
      input.relation,
    )
  ) {
    throw new Error(`invalid pair relation: ${input.relation}`);
  }

  const matrix = getKnowledgeCompatibilityMatrix(matrixId);
  if (!matrix) throw new Error(`matrix not found: ${matrixId}`);
  if (matrix.status !== "ACTIVE" && matrix.status !== "DRAFT") {
    throw new Error(`matrix not editable: ${matrixId}`);
  }

  const duplicateKey = [...pairs.values()].find(
    (p) => p.matrixId === matrixId && p.pairKey === pairKey,
  );
  if (duplicateKey) throw new Error(`pairKey already exists: ${pairKey}`);

  const duplicateSeq = [...pairs.values()].find(
    (p) => p.matrixId === matrixId && p.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`pair sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("knwcmppair");
  if (pairs.has(id)) throw new Error(`pair already exists: ${id}`);

  const now = nowIso();
  const pair: KnowledgeCompatibilityPair = {
    id,
    matrixId,
    pairKey,
    sequence: input.sequence,
    status: KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES[0],
    relation: input.relation,
    upstreamVersionRef,
    downstreamVersionRef,
    policyKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  pairs.set(id, pair);
  return clonePair(pair);
}

export function updateKnowledgeCompatibilityPairStatus(
  input: UpdateKnowledgeCompatibilityPairStatusInput,
): KnowledgeCompatibilityPair {
  const pairId = input.pairId.trim();
  if (!pairId) throw new Error("pair.pairId is required");
  if (
    !(KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid pair status: ${input.status}`);
  }

  const existing = pairs.get(pairId);
  if (!existing) throw new Error(`pair not found: ${pairId}`);

  const updated: KnowledgeCompatibilityPair = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  pairs.set(pairId, updated);
  return clonePair(updated);
}

export function getKnowledgeCompatibilityPair(
  id: string,
): KnowledgeCompatibilityPair | undefined {
  const pair = pairs.get(id.trim());
  return pair ? clonePair(pair) : undefined;
}

export function listKnowledgeCompatibilityPairs(filter?: {
  matrixId?: string;
  status?: KnowledgeCompatibilityPairStatus;
}): KnowledgeCompatibilityPair[] {
  let result = [...pairs.values()];
  if (filter?.matrixId) {
    const matrixId = filter.matrixId.trim();
    result = result.filter((p) => p.matrixId === matrixId);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort(
      (a, b) =>
        a.sequence - b.sequence || a.pairKey.localeCompare(b.pairKey),
    )
    .map(clonePair);
}

export function clearKnowledgeCompatibilityPairs(): void {
  pairs.clear();
}
