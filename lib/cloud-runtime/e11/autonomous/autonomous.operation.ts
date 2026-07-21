/**
 * E11-P6 — Autonomous Operation Model
 */

import {
  AUTONOMOUS_OPERATION_KINDS,
  AUTONOMOUS_OPERATION_STATUSES,
} from "./autonomous.constants";
import type {
  AutonomousOperation,
  AutonomousOperationKind,
  AutonomousOperationStatus,
  CreateAutonomousOperationInput,
} from "./autonomous.types";

const operations = new Map<string, AutonomousOperation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOp(op: AutonomousOperation): AutonomousOperation {
  return { ...op, metadata: { ...op.metadata } };
}

export function createOperation(
  input: CreateAutonomousOperationInput,
): AutonomousOperation {
  const title = input.title.trim();
  if (!title) throw new Error("operation.title is required");
  if (!(AUTONOMOUS_OPERATION_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid operation kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("aop");
  if (operations.has(id)) {
    throw new Error(`operation already exists: ${id}`);
  }

  const op: AutonomousOperation = {
    id,
    kind: input.kind,
    status: "PENDING",
    title,
    runtimeId: input.runtimeId?.trim() || undefined,
    tenantId: input.tenantId?.trim() || undefined,
    anomalyId: input.anomalyId?.trim() || undefined,
    incidentId: input.incidentId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  operations.set(id, op);
  return cloneOp(op);
}

export function getOperation(id: string): AutonomousOperation | undefined {
  const op = operations.get(id.trim());
  return op ? cloneOp(op) : undefined;
}

export function listOperations(filter?: {
  kind?: AutonomousOperationKind;
  status?: AutonomousOperationStatus;
  runtimeId?: string;
  tenantId?: string;
}): AutonomousOperation[] {
  let result = [...operations.values()];
  if (filter?.kind) result = result.filter((o) => o.kind === filter.kind);
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((o) => o.runtimeId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((o) => o.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOp);
}

export function updateOperation(
  id: string,
  patch: Partial<
    Pick<
      AutonomousOperation,
      | "status"
      | "startedAt"
      | "finishedAt"
      | "result"
      | "error"
      | "incidentId"
    >
  >,
): AutonomousOperation {
  const op = operations.get(id.trim());
  if (!op) throw new Error(`operation not found: ${id}`);
  if (patch.status !== undefined) {
    if (
      !(AUTONOMOUS_OPERATION_STATUSES as readonly string[]).includes(
        patch.status,
      )
    ) {
      throw new Error(`invalid operation status: ${patch.status}`);
    }
    op.status = patch.status;
  }
  if (patch.startedAt !== undefined) op.startedAt = patch.startedAt;
  if (patch.finishedAt !== undefined) op.finishedAt = patch.finishedAt;
  if (patch.result !== undefined) op.result = patch.result;
  if (patch.error !== undefined) op.error = patch.error;
  if (patch.incidentId !== undefined) op.incidentId = patch.incidentId;
  operations.set(op.id, op);
  return cloneOp(op);
}

export function clearOperations(): void {
  operations.clear();
}
