/**
 * Product Metering — Aggregate registry
 */

import { listUsageEvents } from "../event/event.registry";
import { getMeter } from "../meter/meter.registry";
import { AGGREGATION_WINDOWS } from "../usage/usage.constants";
import type {
  AggregateUsageInput,
  AggregationWindow,
  UsageAggregate,
} from "./aggregate.types";

const aggregates = new Map<string, UsageAggregate>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAggregate(aggregate: UsageAggregate): UsageAggregate {
  return { ...aggregate, metadata: { ...aggregate.metadata } };
}

export function aggregateUsage(
  input: AggregateUsageInput,
): UsageAggregate {
  const meterId = input.meterId.trim();
  const accountId = input.accountId.trim();
  if (!meterId) throw new Error("aggregate.meterId is required");
  if (!accountId) throw new Error("aggregate.accountId is required");

  const window = input.window ?? AGGREGATION_WINDOWS[1];
  if (!(AGGREGATION_WINDOWS as readonly string[]).includes(window)) {
    throw new Error(`invalid aggregation window: ${window}`);
  }

  if (!getMeter(meterId)) throw new Error(`meter not found: ${meterId}`);

  const events = listUsageEvents({ meterId, accountId });
  if (events.length === 0) {
    throw new Error(
      `no usage events for meter=${meterId} account=${accountId}`,
    );
  }

  const totalQuantity = events.reduce((sum, e) => sum + e.quantity, 0);
  const id = input.id?.trim() || createId("metagg");
  if (aggregates.has(id)) {
    throw new Error(`aggregate already exists: ${id}`);
  }

  const aggregate: UsageAggregate = {
    id,
    meterId,
    accountId,
    window,
    totalQuantity,
    eventCount: events.length,
    detail: `window=${window} total=${totalQuantity}`,
    metadata: { ...(input.metadata ?? {}) },
    aggregatedAt: nowIso(),
  };
  aggregates.set(id, aggregate);
  return cloneAggregate(aggregate);
}

export function getAggregate(id: string): UsageAggregate | undefined {
  const aggregate = aggregates.get(id.trim());
  return aggregate ? cloneAggregate(aggregate) : undefined;
}

export function listAggregates(filter?: {
  meterId?: string;
  accountId?: string;
  window?: AggregationWindow;
}): UsageAggregate[] {
  let result = [...aggregates.values()];
  if (filter?.meterId) {
    const meterId = filter.meterId.trim();
    result = result.filter((a) => a.meterId === meterId);
  }
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((a) => a.accountId === accountId);
  }
  if (filter?.window) {
    result = result.filter((a) => a.window === filter.window);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAggregate);
}

export function clearAggregates(): void {
  aggregates.clear();
}
