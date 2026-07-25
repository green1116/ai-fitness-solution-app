/**
 * Product Subscription — Subscription registry
 */

import { SUBSCRIPTION_STATUSES } from "../lifecycle/lifecycle.constants";
import type {
  CreateSubscriptionInput,
  ProductSubscription,
  SubscriptionStatus,
  UpdateSubscriptionPlanInput,
  UpdateSubscriptionStatusInput,
} from "./subscription.types";

const subscriptions = new Map<string, ProductSubscription>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSubscription(
  subscription: ProductSubscription,
): ProductSubscription {
  return { ...subscription, metadata: { ...subscription.metadata } };
}

export function createSubscription(
  input: CreateSubscriptionInput,
): ProductSubscription {
  const accountId = input.accountId.trim();
  const planId = input.planId.trim();
  if (!accountId) throw new Error("subscription.accountId is required");
  if (!planId) throw new Error("subscription.planId is required");

  const seats = input.seats ?? 1;
  if (!Number.isFinite(seats) || seats < 1) {
    throw new Error("subscription.seats must be >= 1");
  }

  const id = input.id?.trim() || createId("subscr");
  if (subscriptions.has(id)) {
    throw new Error(`subscription already exists: ${id}`);
  }

  const status: SubscriptionStatus = input.trial ? "TRIAL" : "ACTIVE";
  const now = nowIso();
  const subscription: ProductSubscription = {
    id,
    accountId,
    planId,
    seats,
    status,
    detail: `status=${status} plan=${planId}`,
    metadata: { ...(input.metadata ?? {}) },
    startedAt: now,
    updatedAt: now,
  };
  subscriptions.set(id, subscription);
  return cloneSubscription(subscription);
}

export function updateSubscriptionStatus(
  input: UpdateSubscriptionStatusInput,
): ProductSubscription {
  const subscriptionId = input.subscriptionId.trim();
  if (!subscriptionId) {
    throw new Error("subscription.subscriptionId is required");
  }
  if (!(SUBSCRIPTION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid subscription status: ${input.status}`);
  }

  const existing = subscriptions.get(subscriptionId);
  if (!existing) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }
  if (existing.status === "CANCELED" && input.status !== "CANCELED") {
    throw new Error(`subscription already canceled: ${subscriptionId}`);
  }

  const now = nowIso();
  const updated: ProductSubscription = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} plan=${existing.planId}`,
    metadata: { ...existing.metadata },
    updatedAt: now,
    canceledAt: input.status === "CANCELED" ? now : existing.canceledAt,
  };
  subscriptions.set(subscriptionId, updated);
  return cloneSubscription(updated);
}

export function updateSubscriptionPlan(
  input: UpdateSubscriptionPlanInput,
): ProductSubscription {
  const subscriptionId = input.subscriptionId.trim();
  const planId = input.planId.trim();
  if (!subscriptionId) {
    throw new Error("subscription.subscriptionId is required");
  }
  if (!planId) throw new Error("subscription.planId is required");
  if (!Number.isFinite(input.seats) || input.seats < 1) {
    throw new Error("subscription.seats must be >= 1");
  }

  const existing = subscriptions.get(subscriptionId);
  if (!existing) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }
  if (existing.status === "CANCELED") {
    throw new Error(`subscription canceled: ${subscriptionId}`);
  }

  const updated: ProductSubscription = {
    ...existing,
    planId,
    seats: input.seats,
    detail: `status=${existing.status} plan=${planId}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  subscriptions.set(subscriptionId, updated);
  return cloneSubscription(updated);
}

export function getSubscription(
  id: string,
): ProductSubscription | undefined {
  const subscription = subscriptions.get(id.trim());
  return subscription ? cloneSubscription(subscription) : undefined;
}

export function listSubscriptions(filter?: {
  accountId?: string;
  status?: SubscriptionStatus;
}): ProductSubscription[] {
  let result = [...subscriptions.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((s) => s.accountId === accountId);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSubscription);
}

export function clearSubscriptions(): void {
  subscriptions.clear();
}
