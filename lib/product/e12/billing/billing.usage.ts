/**
 * E12-P4 — Usage Meter
 */

import { getBillingSubscription } from "./billing.subscription";
import { USAGE_METER_UNITS } from "./billing.constants";
import type { RecordUsageInput, UsageMeterRecord, UsageMeterUnit } from "./billing.types";

const usageRecords = new Map<string, UsageMeterRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: UsageMeterRecord): UsageMeterRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function recordUsage(input: RecordUsageInput): UsageMeterRecord {
  const productTenantId = input.productTenantId.trim();
  const billingSubscriptionId = input.billingSubscriptionId.trim();
  const meter = input.meter;
  const quantity = input.quantity;

  if (quantity < 0) throw new Error("usage quantity must be non-negative");
  if (!(USAGE_METER_UNITS as readonly string[]).includes(meter)) {
    throw new Error(`invalid meter unit: ${meter}`);
  }

  const sub = getBillingSubscription(billingSubscriptionId);
  if (!sub || sub.productTenantId !== productTenantId) {
    throw new Error(`billing subscription not found: ${billingSubscriptionId}`);
  }
  if (sub.status !== "ACTIVE" && sub.status !== "PAST_DUE") {
    throw new Error(`usage requires ACTIVE subscription (current=${sub.status})`);
  }

  const id = input.id?.trim() || createId("usage");
  if (usageRecords.has(id)) throw new Error(`usage record already exists: ${id}`);

  const record: UsageMeterRecord = {
    id,
    productTenantId,
    billingSubscriptionId,
    meter,
    quantity,
    recordedAt: nowIso(),
    metadata: { ...(input.metadata ?? {}) },
  };
  usageRecords.set(id, record);
  return cloneRecord(record);
}

export function getUsageRecord(id: string): UsageMeterRecord | undefined {
  const record = usageRecords.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listUsageRecords(filter?: {
  productTenantId?: string;
  billingSubscriptionId?: string;
  meter?: UsageMeterUnit;
}): UsageMeterRecord[] {
  let result = [...usageRecords.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((r) => r.productTenantId === tid);
  }
  if (filter?.billingSubscriptionId) {
    const sid = filter.billingSubscriptionId.trim();
    result = result.filter((r) => r.billingSubscriptionId === sid);
  }
  if (filter?.meter) result = result.filter((r) => r.meter === filter.meter);
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneRecord);
}

export function getUsageTotal(input: {
  billingSubscriptionId: string;
  meter: UsageMeterUnit;
}): number {
  return listUsageRecords({
    billingSubscriptionId: input.billingSubscriptionId,
    meter: input.meter,
  }).reduce((sum, r) => sum + r.quantity, 0);
}

export function clearUsageRecords(): void {
  usageRecords.clear();
}
