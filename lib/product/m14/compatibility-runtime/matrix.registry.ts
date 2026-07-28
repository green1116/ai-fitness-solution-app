/**
 * Product M14 — Intelligence compatibility matrix registry (in-memory)
 */

import {
  INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES,
} from "./compatibility.constants";
import type {
  IntelligenceCompatibilityMatrix,
  IntelligenceCompatibilityMatrixKind,
  IntelligenceCompatibilityMatrixStatus,
  RegisterIntelligenceCompatibilityMatrixInput,
  UpdateIntelligenceCompatibilityMatrixStatusInput,
} from "./compatibility.types";

const matrices = new Map<string, IntelligenceCompatibilityMatrix>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMatrix(
  matrix: IntelligenceCompatibilityMatrix,
): IntelligenceCompatibilityMatrix {
  return { ...matrix, metadata: { ...matrix.metadata } };
}

export function registerIntelligenceCompatibilityMatrix(
  input: RegisterIntelligenceCompatibilityMatrixInput,
): IntelligenceCompatibilityMatrix {
  const matrixKey = input.matrixKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!matrixKey) throw new Error("matrix.matrixKey is required");
  if (!title) throw new Error("matrix.title is required");
  if (!summary) throw new Error("matrix.summary is required");
  if (
    !(INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid matrix kind: ${input.kind}`);
  }
  if (keys.has(matrixKey)) {
    throw new Error(`matrixKey already exists: ${matrixKey}`);
  }

  const id = input.id?.trim() || createId("intcmp");
  if (matrices.has(id)) throw new Error(`matrix already exists: ${id}`);

  const now = nowIso();
  const matrix: IntelligenceCompatibilityMatrix = {
    id,
    matrixKey,
    kind: input.kind,
    status: INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES[0],
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

export function updateIntelligenceCompatibilityMatrixStatus(
  input: UpdateIntelligenceCompatibilityMatrixStatusInput,
): IntelligenceCompatibilityMatrix {
  const matrixId = input.matrixId.trim();
  if (!matrixId) throw new Error("matrix.matrixId is required");
  if (
    !(INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid matrix status: ${input.status}`);
  }

  const existing = matrices.get(matrixId);
  if (!existing) throw new Error(`matrix not found: ${matrixId}`);

  const updated: IntelligenceCompatibilityMatrix = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  matrices.set(matrixId, updated);
  return cloneMatrix(updated);
}

export function getIntelligenceCompatibilityMatrix(
  id: string,
): IntelligenceCompatibilityMatrix | undefined {
  const matrix = matrices.get(id.trim());
  return matrix ? cloneMatrix(matrix) : undefined;
}

export function listIntelligenceCompatibilityMatrices(filter?: {
  kind?: IntelligenceCompatibilityMatrixKind;
  status?: IntelligenceCompatibilityMatrixStatus;
}): IntelligenceCompatibilityMatrix[] {
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

export function clearIntelligenceCompatibilityMatrices(): void {
  matrices.clear();
  keys.clear();
}
