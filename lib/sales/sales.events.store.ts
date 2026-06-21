/**
 * V60 P3 — Sales signal event store (in-process, per instance)
 */

export type SalesSignalType =
  | "quote.generated"
  | "quote.repeated"
  | "budget.viewed"
  | "budget.exported"
  | "tender.viewed"
  | "tender.generated"
  | "pricing.page_visit"
  | "api.usage_spike"
  | "follow_up_needed"
  | "hot_deal";

export type SalesSignalRecord = {
  organizationId: string;
  customerId?: string;
  userId?: string;
  signal: SalesSignalType;
  count: number;
  meta?: Record<string, unknown>;
  timestamp: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __salesSignals: SalesSignalRecord[] | undefined;
}

function getStore(): SalesSignalRecord[] {
  globalThis.__salesSignals ||= [];
  return globalThis.__salesSignals;
}

export function appendSalesSignal(event: Omit<SalesSignalRecord, "timestamp" | "count"> & { count?: number }) {
  const store = getStore();
  const existing = store.find(
    (s) =>
      s.organizationId === event.organizationId &&
      s.signal === event.signal &&
      s.customerId === event.customerId,
  );

  if (existing) {
    existing.count += event.count ?? 1;
    existing.timestamp = Date.now();
    existing.meta = { ...existing.meta, ...event.meta };
    return existing;
  }

  const record: SalesSignalRecord = {
    ...event,
    count: event.count ?? 1,
    timestamp: Date.now(),
  };
  store.push(record);
  if (store.length > 5000) store.shift();
  return record;
}

export function getSalesSignals(filter?: {
  organizationId?: string;
  customerId?: string;
  signal?: SalesSignalType;
}): SalesSignalRecord[] {
  return getStore().filter((s) => {
    if (filter?.organizationId && s.organizationId !== filter.organizationId) return false;
    if (filter?.customerId && s.customerId !== filter.customerId) return false;
    if (filter?.signal && s.signal !== filter.signal) return false;
    return true;
  });
}

export function countSignal(
  organizationId: string,
  signal: SalesSignalType,
  customerId?: string,
): number {
  return getSalesSignals({ organizationId, customerId, signal }).reduce((sum, s) => sum + s.count, 0);
}

export function clearSalesSignalsForTests(): void {
  globalThis.__salesSignals = [];
}
