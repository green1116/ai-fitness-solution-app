/**
 * Launch L4 — Delivery status
 */

import { DELIVERY_STATUSES } from "../scenario/scenario.constants";
import { getScenario } from "../scenario/scenario.registry";
import type {
  DeliveryStatus,
  DeliveryStatusRecord,
  UpdateDeliveryStatusInput,
} from "./delivery.types";

const statuses = new Map<string, DeliveryStatusRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStatus(status: DeliveryStatusRecord): DeliveryStatusRecord {
  return { ...status, metadata: { ...status.metadata } };
}

export function updateDeliveryStatus(
  input: UpdateDeliveryStatusInput,
): DeliveryStatusRecord {
  const scenarioId = input.scenarioId.trim();
  if (!scenarioId) throw new Error("deliveryStatus.scenarioId is required");
  if (!getScenario(scenarioId)) {
    throw new Error(`scenario not found: ${scenarioId}`);
  }
  if (!(DELIVERY_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid delivery status: ${input.status}`);
  }

  const id = input.id?.trim() || createId("l4sts");
  if (statuses.has(id)) {
    throw new Error(`delivery status already exists: ${id}`);
  }

  const record: DeliveryStatusRecord = {
    id,
    scenarioId,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  statuses.set(id, record);
  return cloneStatus(record);
}

export function getDeliveryStatusRecord(
  id: string,
): DeliveryStatusRecord | undefined {
  const record = statuses.get(id.trim());
  return record ? cloneStatus(record) : undefined;
}

export function listDeliveryStatusRecords(filter?: {
  scenarioId?: string;
  status?: DeliveryStatus;
}): DeliveryStatusRecord[] {
  let result = [...statuses.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((s) => s.scenarioId === sid);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStatus);
}

export function clearDeliveryStatusRecords(): void {
  statuses.clear();
}
