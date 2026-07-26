/**
 * Product Delivery — Status registry
 */

import { DELIVERY_STATUSES } from "../management/management.constants";
import { getDeliveryRequest } from "../request/request.registry";
import type {
  DeliveryStatus,
  DeliveryStatusRecord,
  OpenDeliveryStatusInput,
  UpdateDeliveryStatusInput,
} from "./status.types";

const statuses = new Map<string, DeliveryStatusRecord>();

const ALLOWED: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  PENDING: ["QUEUED", "FAILED"],
  QUEUED: ["DISPATCHING", "FAILED"],
  DISPATCHING: ["SUCCEEDED", "FAILED", "RETRYING"],
  RETRYING: ["DISPATCHING", "FAILED"],
  SUCCEEDED: [],
  FAILED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStatus(record: DeliveryStatusRecord): DeliveryStatusRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function openDeliveryStatus(
  input: OpenDeliveryStatusInput,
): DeliveryStatusRecord {
  const requestId = input.requestId.trim();
  if (!requestId) throw new Error("status.requestId is required");
  if (!getDeliveryRequest(requestId)) {
    throw new Error(`request not found: ${requestId}`);
  }

  const duplicate = [...statuses.values()].find(
    (s) => s.requestId === requestId,
  );
  if (duplicate) throw new Error(`status already exists: ${requestId}`);

  const id = input.id?.trim() || createId("dlvsts");
  if (statuses.has(id)) throw new Error(`status already exists: ${id}`);

  const now = nowIso();
  const record: DeliveryStatusRecord = {
    id,
    requestId,
    status: DELIVERY_STATUSES[0],
    attempt: 0,
    detail: "status=PENDING",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  statuses.set(id, record);
  return cloneStatus(record);
}

export function updateDeliveryStatus(
  input: UpdateDeliveryStatusInput,
): DeliveryStatusRecord {
  const statusId = input.statusId.trim();
  if (!statusId) throw new Error("status.statusId is required");
  if (!(DELIVERY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid delivery status: ${input.status}`);
  }

  const existing = statuses.get(statusId);
  if (!existing) throw new Error(`status not found: ${statusId}`);

  const allowed = ALLOWED[existing.status];
  if (!allowed.includes(input.status)) {
    throw new Error(
      `invalid status transition: ${existing.status} -> ${input.status}`,
    );
  }

  const attempt =
    input.attempt !== undefined
      ? Math.floor(input.attempt)
      : input.status === "RETRYING"
        ? existing.attempt + 1
        : existing.attempt;
  if (!Number.isFinite(attempt) || attempt < 0) {
    throw new Error("status.attempt must be >= 0");
  }

  const updated: DeliveryStatusRecord = {
    ...existing,
    status: input.status,
    attempt,
    detail: `status=${input.status} attempt=${attempt}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  statuses.set(statusId, updated);
  return cloneStatus(updated);
}

export function getDeliveryStatus(
  id: string,
): DeliveryStatusRecord | undefined {
  const record = statuses.get(id.trim());
  return record ? cloneStatus(record) : undefined;
}

export function listDeliveryStatuses(filter?: {
  requestId?: string;
  status?: DeliveryStatus;
}): DeliveryStatusRecord[] {
  let result = [...statuses.values()];
  if (filter?.requestId) {
    const requestId = filter.requestId.trim();
    result = result.filter((s) => s.requestId === requestId);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStatus);
}

export function clearDeliveryStatuses(): void {
  statuses.clear();
}
