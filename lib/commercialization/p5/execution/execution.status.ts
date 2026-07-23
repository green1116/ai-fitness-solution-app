/**
 * Commercialization P5 — Execution status
 */

import { EXECUTION_STATUSES } from "../delivery/delivery.constants";
import {
  applyExecutionState,
  getDeliveryExecution,
} from "./execution.runner";
import type {
  ExecutionStatus,
  ExecutionStatusRecord,
  RecordExecutionStatusInput,
} from "./execution.types";

const statuses = new Map<string, ExecutionStatusRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStatus(
  record: ExecutionStatusRecord,
): ExecutionStatusRecord {
  return { ...record };
}

export function recordExecutionStatus(
  input: RecordExecutionStatusInput,
): ExecutionStatusRecord {
  const executionId = input.executionId.trim();
  const execution = getDeliveryExecution(executionId);
  if (!execution) throw new Error(`execution not found: ${executionId}`);

  const status = input.status;
  if (!(EXECUTION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid execution status: ${status}`);
  }

  const progress =
    input.progress ??
    (status === "SUCCEEDED"
      ? 100
      : status === "RUNNING"
        ? Math.max(execution.progress, 25)
        : execution.progress);

  applyExecutionState(executionId, status, progress);

  const id = input.id?.trim() || createId("estat");
  if (statuses.has(id)) {
    throw new Error(`execution status record already exists: ${id}`);
  }

  const record: ExecutionStatusRecord = {
    id,
    executionId,
    status,
    progress: Math.max(0, Math.min(100, Math.round(progress))),
    note: (input.note ?? `status=${status}`).trim(),
    recordedAt: nowIso(),
  };
  statuses.set(id, record);
  return cloneStatus(record);
}

export function getExecutionStatusRecord(
  id: string,
): ExecutionStatusRecord | undefined {
  const record = statuses.get(id.trim());
  return record ? cloneStatus(record) : undefined;
}

export function listExecutionStatusRecords(filter?: {
  executionId?: string;
  status?: ExecutionStatus;
}): ExecutionStatusRecord[] {
  let result = [...statuses.values()];
  if (filter?.executionId) {
    const eid = filter.executionId.trim();
    result = result.filter((r) => r.executionId === eid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStatus);
}

export function clearExecutionStatusRecords(): void {
  statuses.clear();
}
