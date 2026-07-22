/**
 * Post-Launch P1 — Operational Status Tracking
 */

import { OPERATIONAL_STATUS_LEVELS } from "./production.constants";
import { getProductionOperation } from "./production.operation";
import type {
  OperationalStatusLevel,
  OperationalStatusRecord,
  RecordOperationalStatusInput,
} from "./production.types";

const records = new Map<string, OperationalStatusRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: OperationalStatusRecord): OperationalStatusRecord {
  return { ...record };
}

export function recordOperationalStatus(
  input: RecordOperationalStatusInput,
): OperationalStatusRecord {
  const productionOperationId = input.productionOperationId.trim();
  const detail = input.detail.trim();
  const level = input.level;

  if (!detail) throw new Error("operationalStatus.detail is required");
  if (!(OPERATIONAL_STATUS_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid operational status level: ${level}`);
  }
  if (!getProductionOperation(productionOperationId)) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
  }

  const id = input.id?.trim() || createId("opstatus");
  if (records.has(id)) {
    throw new Error(`operational status already exists: ${id}`);
  }

  const record: OperationalStatusRecord = {
    id,
    productionOperationId,
    level,
    detail,
    source: input.source?.trim() || "manual",
    recordedAt: nowIso(),
  };
  records.set(id, record);
  return cloneRecord(record);
}

export function getOperationalStatus(
  id: string,
): OperationalStatusRecord | undefined {
  const record = records.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listOperationalStatuses(filter?: {
  productionOperationId?: string;
  level?: OperationalStatusLevel;
}): OperationalStatusRecord[] {
  let result = [...records.values()];
  if (filter?.productionOperationId) {
    const oid = filter.productionOperationId.trim();
    result = result.filter((r) => r.productionOperationId === oid);
  }
  if (filter?.level) result = result.filter((r) => r.level === filter.level);
  return result
    .slice()
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .map(cloneRecord);
}

export function getLatestOperationalStatus(
  productionOperationId: string,
): OperationalStatusRecord | undefined {
  return listOperationalStatuses({ productionOperationId })[0];
}

export function clearOperationalStatuses(): void {
  records.clear();
}
