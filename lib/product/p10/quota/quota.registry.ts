/**
 * Product P10 — Quota registry
 */

import { QUOTA_UNITS } from "../subscription/subscription.constants";
import { getSubscription } from "../subscription/subscription.registry";
import type {
  ConsumeQuotaInput,
  CreateQuotaInput,
  Quota,
  QuotaUnit,
} from "./quota.types";

const quotas = new Map<string, Quota>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuota(quota: Quota): Quota {
  return { ...quota, metadata: { ...quota.metadata } };
}

export function createQuota(input: CreateQuotaInput): Quota {
  const subscriptionId = input.subscriptionId.trim();
  if (!subscriptionId) throw new Error("quota.subscriptionId is required");
  if (!(QUOTA_UNITS as readonly string[]).includes(input.unit)) {
    throw new Error(`invalid quota unit: ${input.unit}`);
  }
  if (!Number.isFinite(input.limit) || input.limit < 0) {
    throw new Error("quota.limit must be a non-negative number");
  }
  const used = input.used ?? 0;
  if (!Number.isFinite(used) || used < 0) {
    throw new Error("quota.used must be a non-negative number");
  }
  if (used > input.limit) {
    throw new Error("quota.used cannot exceed limit");
  }
  if (!getSubscription(subscriptionId)) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }

  const id = input.id?.trim() || createId("p10qta");
  if (quotas.has(id)) {
    throw new Error(`quota already exists: ${id}`);
  }

  const now = nowIso();
  const quota: Quota = {
    id,
    subscriptionId,
    unit: input.unit,
    limit: input.limit,
    used,
    detail: `unit=${input.unit} used=${used}/${input.limit}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  quotas.set(id, quota);
  return cloneQuota(quota);
}

export function consumeQuota(input: ConsumeQuotaInput): Quota {
  const quotaId = input.quotaId.trim();
  if (!quotaId) throw new Error("quota.quotaId is required");
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("quota.amount must be a positive number");
  }
  const existing = quotas.get(quotaId);
  if (!existing) throw new Error(`quota not found: ${quotaId}`);
  const used = existing.used + input.amount;
  if (used > existing.limit) {
    throw new Error(
      `quota exceeded: ${quotaId} used=${used} limit=${existing.limit}`,
    );
  }

  const updated: Quota = {
    ...existing,
    used,
    detail: `unit=${existing.unit} used=${used}/${existing.limit}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  quotas.set(quotaId, updated);
  return cloneQuota(updated);
}

export function getQuota(id: string): Quota | undefined {
  const quota = quotas.get(id.trim());
  return quota ? cloneQuota(quota) : undefined;
}

export function listQuotas(filter?: {
  subscriptionId?: string;
  unit?: QuotaUnit;
}): Quota[] {
  let result = [...quotas.values()];
  if (filter?.subscriptionId) {
    const sid = filter.subscriptionId.trim();
    result = result.filter((q) => q.subscriptionId === sid);
  }
  if (filter?.unit) result = result.filter((q) => q.unit === filter.unit);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuota);
}

export function clearQuotas(): void {
  quotas.clear();
}
