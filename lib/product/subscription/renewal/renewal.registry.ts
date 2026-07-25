/**
 * Product Subscription — Renewal registry
 */

import {
  getSubscription,
  updateSubscriptionStatus,
} from "../subscription/subscription.registry";
import type {
  RenewSubscriptionInput,
  RenewalResult,
  SubscriptionRenewal,
} from "./renewal.types";

const renewals = new Map<string, SubscriptionRenewal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRenewal(renewal: SubscriptionRenewal): SubscriptionRenewal {
  return { ...renewal, metadata: { ...renewal.metadata } };
}

export function renewSubscription(
  input: RenewSubscriptionInput,
): SubscriptionRenewal {
  const subscriptionId = input.subscriptionId.trim();
  if (!subscriptionId) {
    throw new Error("renewal.subscriptionId is required");
  }

  const subscription = getSubscription(subscriptionId);
  if (!subscription) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }
  if (
    subscription.status !== "ACTIVE" &&
    subscription.status !== "TRIAL" &&
    subscription.status !== "PAST_DUE"
  ) {
    throw new Error(`subscription not renewable: ${subscriptionId}`);
  }

  const succeed = input.succeed ?? true;
  const result: RenewalResult = succeed ? "RENEWED" : "FAILED";
  const periodDays = input.periodDays ?? 30;
  if (!Number.isFinite(periodDays) || periodDays < 1) {
    throw new Error("renewal.periodDays must be >= 1");
  }

  const periodStart = nowIso();
  const periodEnd = new Date(
    Date.now() + periodDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  if (succeed) {
    updateSubscriptionStatus({ subscriptionId, status: "ACTIVE" });
  } else {
    updateSubscriptionStatus({ subscriptionId, status: "PAST_DUE" });
  }

  const id = input.id?.trim() || createId("subren");
  if (renewals.has(id)) throw new Error(`renewal already exists: ${id}`);

  const renewal: SubscriptionRenewal = {
    id,
    subscriptionId,
    result,
    periodStart,
    periodEnd,
    detail: `result=${result} days=${periodDays}`,
    metadata: { ...(input.metadata ?? {}) },
    renewedAt: nowIso(),
  };
  renewals.set(id, renewal);
  return cloneRenewal(renewal);
}

export function getRenewal(id: string): SubscriptionRenewal | undefined {
  const renewal = renewals.get(id.trim());
  return renewal ? cloneRenewal(renewal) : undefined;
}

export function listRenewals(filter?: {
  subscriptionId?: string;
  result?: RenewalResult;
}): SubscriptionRenewal[] {
  let result = [...renewals.values()];
  if (filter?.subscriptionId) {
    const subscriptionId = filter.subscriptionId.trim();
    result = result.filter((r) => r.subscriptionId === subscriptionId);
  }
  if (filter?.result) {
    result = result.filter((r) => r.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRenewal);
}

export function clearRenewals(): void {
  renewals.clear();
}
