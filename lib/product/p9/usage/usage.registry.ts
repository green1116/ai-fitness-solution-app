/**
 * Product P9 — Usage registry
 */

import { USAGE_TRENDS } from "../customer-health/health.constants";
import { getCustomerHealth } from "../customer-health/health.registry";
import type {
  CreateUsageInput,
  UsageSnapshot,
  UsageTrend,
} from "./usage.types";

const usageRecords = new Map<string, UsageSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneUsage(usage: UsageSnapshot): UsageSnapshot {
  return { ...usage, metadata: { ...usage.metadata } };
}

export function createUsage(input: CreateUsageInput): UsageSnapshot {
  const healthId = input.healthId.trim();
  if (!healthId) throw new Error("usage.healthId is required");
  if (!Number.isFinite(input.activeUsers) || input.activeUsers < 0) {
    throw new Error("usage.activeUsers must be a non-negative number");
  }
  if (!Number.isFinite(input.sessions) || input.sessions < 0) {
    throw new Error("usage.sessions must be a non-negative number");
  }
  if (!(USAGE_TRENDS as readonly string[]).includes(input.trend)) {
    throw new Error(`invalid usage trend: ${input.trend}`);
  }
  if (!getCustomerHealth(healthId)) {
    throw new Error(`customer health not found: ${healthId}`);
  }

  const id = input.id?.trim() || createId("p9usg");
  if (usageRecords.has(id)) {
    throw new Error(`usage snapshot already exists: ${id}`);
  }

  const usage: UsageSnapshot = {
    id,
    healthId,
    activeUsers: input.activeUsers,
    sessions: input.sessions,
    trend: input.trend,
    detail: `trend=${input.trend} users=${input.activeUsers}`,
    metadata: { ...(input.metadata ?? {}) },
    capturedAt: nowIso(),
  };
  usageRecords.set(id, usage);
  return cloneUsage(usage);
}

export function getUsage(id: string): UsageSnapshot | undefined {
  const usage = usageRecords.get(id.trim());
  return usage ? cloneUsage(usage) : undefined;
}

export function listUsage(filter?: {
  healthId?: string;
  trend?: UsageTrend;
}): UsageSnapshot[] {
  let result = [...usageRecords.values()];
  if (filter?.healthId) {
    const hid = filter.healthId.trim();
    result = result.filter((u) => u.healthId === hid);
  }
  if (filter?.trend) result = result.filter((u) => u.trend === filter.trend);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneUsage);
}

export function clearUsage(): void {
  usageRecords.clear();
}
