/**
 * Product P10 — Subscription registry
 */

import { SUBSCRIPTION_STATUSES } from "./subscription.constants";
import type {
  BindSubscriptionPlanInput,
  CreateSubscriptionInput,
  Subscription,
  SubscriptionStatus,
  UpdateSubscriptionStatusInput,
} from "./subscription.types";

const subscriptions = new Map<string, Subscription>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSubscription(subscription: Subscription): Subscription {
  return { ...subscription, metadata: { ...subscription.metadata } };
}

export function createSubscription(
  input: CreateSubscriptionInput,
): Subscription {
  const accountRef = input.accountRef.trim();
  const healthRef = input.healthRef.trim();
  const owner = input.owner.trim();
  if (!accountRef) throw new Error("subscription.accountRef is required");
  if (!healthRef) throw new Error("subscription.healthRef is required");
  if (!owner) throw new Error("subscription.owner is required");

  const id = input.id?.trim() || createId("p10sub");
  if (subscriptions.has(id)) {
    throw new Error(`subscription already exists: ${id}`);
  }

  const now = nowIso();
  const status = SUBSCRIPTION_STATUSES[0];
  const planId = input.planId?.trim();
  const subscription: Subscription = {
    id,
    accountRef,
    healthRef,
    planId,
    status,
    owner,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  subscriptions.set(id, subscription);
  return cloneSubscription(subscription);
}

export function bindSubscriptionPlan(
  input: BindSubscriptionPlanInput,
): Subscription {
  const subscriptionId = input.subscriptionId.trim();
  const planId = input.planId.trim();
  if (!subscriptionId) {
    throw new Error("subscription.subscriptionId is required");
  }
  if (!planId) throw new Error("subscription.planId is required");
  const existing = subscriptions.get(subscriptionId);
  if (!existing) throw new Error(`subscription not found: ${subscriptionId}`);

  const updated: Subscription = {
    ...existing,
    planId,
    detail: `status=${existing.status} plan=${planId}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  subscriptions.set(subscriptionId, updated);
  return cloneSubscription(updated);
}

export function updateSubscriptionStatus(
  input: UpdateSubscriptionStatusInput,
): Subscription {
  const subscriptionId = input.subscriptionId.trim();
  if (!subscriptionId) {
    throw new Error("subscription.subscriptionId is required");
  }
  if (!(SUBSCRIPTION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid subscription status: ${input.status}`);
  }
  const existing = subscriptions.get(subscriptionId);
  if (!existing) throw new Error(`subscription not found: ${subscriptionId}`);

  const updated: Subscription = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  subscriptions.set(subscriptionId, updated);
  return cloneSubscription(updated);
}

export function getSubscription(id: string): Subscription | undefined {
  const subscription = subscriptions.get(id.trim());
  return subscription ? cloneSubscription(subscription) : undefined;
}

export function listSubscriptions(filter?: {
  accountRef?: string;
  status?: SubscriptionStatus;
}): Subscription[] {
  let result = [...subscriptions.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSubscription);
}

export function clearSubscriptions(): void {
  subscriptions.clear();
}
