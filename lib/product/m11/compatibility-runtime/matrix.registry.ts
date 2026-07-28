/**
 * Product M11 — Knowledge compatibility matrix registry (in-memory)
 */

import {
  KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES,
} from "./compatibility.constants";
import type {
  KnowledgeCompatibilityMatrix,
  KnowledgeCompatibilityMatrixKind,
  KnowledgeCompatibilityMatrixStatus,
  RegisterKnowledgeCompatibilityMatrixInput,
  UpdateKnowledgeCompatibilityMatrixStatusInput,
} from "./compatibility.types";

const matrices = new Map<string, KnowledgeCompatibilityMatrix>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMatrix(
  matrix: KnowledgeCompatibilityMatrix,
): KnowledgeCompatibilityMatrix {
  return { ...matrix, metadata: { ...matrix.metadata } };
}

export function registerKnowledgeCompatibilityMatrix(
  input: RegisterKnowledgeCompatibilityMatrixInput,
): KnowledgeCompatibilityMatrix {
  const matrixKey = input.matrixKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!matrixKey) throw new Error("matrix.matrixKey is required");
  if (!title) throw new Error("matrix.title is required");
  if (!summary) throw new Error("matrix.summary is required");
  if (
    !(KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid matrix kind: ${input.kind}`);
  }
  if (keys.has(matrixKey)) {
    throw new Error(`matrixKey already exists: ${matrixKey}`);
  }

  const id = input.id?.trim() || createId("knwcmp");
  if (matrices.has(id)) throw new Error(`matrix already exists: ${id}`);

  const now = nowIso();
  const matrix: KnowledgeCompatibilityMatrix = {
    id,
    matrixKey,
    kind: input.kind,
    status: KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  matrices.set(id, matrix);
  keys.set(matrixKey, id);
  return cloneMatrix(matrix);
}

export function updateKnowledgeCompatibilityMatrixStatus(
  input: UpdateKnowledgeCompatibilityMatrixStatusInput,
): KnowledgeCompatibilityMatrix {
  const matrixId = input.matrixId.trim();
  if (!matrixId) throw new Error("matrix.matrixId is required");
  if (
    !(KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid matrix status: ${input.status}`);
  }

  const existing = matrices.get(matrixId);
  if (!existing) throw new Error(`matrix not found: ${matrixId}`);

  const updated: KnowledgeCompatibilityMatrix = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  matrices.set(matrixId, updated);
  return cloneMatrix(updated);
}

export function getKnowledgeCompatibilityMatrix(
  id: string,
): KnowledgeCompatibilityMatrix | undefined {
  const matrix = matrices.get(id.trim());
  return matrix ? cloneMatrix(matrix) : undefined;
}

export function listKnowledgeCompatibilityMatrices(filter?: {
  kind?: KnowledgeCompatibilityMatrixKind;
  status?: KnowledgeCompatibilityMatrixStatus;
}): KnowledgeCompatibilityMatrix[] {
  let result = [...matrices.values()];
  if (filter?.kind) result = result.filter((m) => m.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.matrixKey.localeCompare(b.matrixKey))
    .map(cloneMatrix);
}

export function clearKnowledgeCompatibilityMatrices(): void {
  matrices.clear();
  keys.clear();
}
