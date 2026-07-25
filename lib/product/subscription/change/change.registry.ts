/**
 * Product Subscription — Change registry
 */

import { CHANGE_KINDS } from "../lifecycle/lifecycle.constants";
import {
  getSubscription,
  updateSubscriptionPlan,
} from "../subscription/subscription.registry";
import type {
  ChangeKind,
  ChangeSubscriptionInput,
  SubscriptionChange,
} from "./change.types";

const changes = new Map<string, SubscriptionChange>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneChange(change: SubscriptionChange): SubscriptionChange {
  return { ...change, metadata: { ...change.metadata } };
}

export function changeSubscription(
  input: ChangeSubscriptionInput,
): SubscriptionChange {
  const subscriptionId = input.subscriptionId.trim();
  if (!subscriptionId) {
    throw new Error("change.subscriptionId is required");
  }
  if (!(CHANGE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid change kind: ${input.kind}`);
  }

  const existing = getSubscription(subscriptionId);
  if (!existing) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }
  if (existing.status === "CANCELED") {
    throw new Error(`subscription canceled: ${subscriptionId}`);
  }

  const toPlanId = (input.toPlanId ?? existing.planId).trim();
  const toSeats = input.toSeats ?? existing.seats;
  if (!toPlanId) throw new Error("change.toPlanId is required");
  if (!Number.isFinite(toSeats) || toSeats < 1) {
    throw new Error("change.toSeats must be >= 1");
  }

  updateSubscriptionPlan({
    subscriptionId,
    planId: toPlanId,
    seats: toSeats,
  });

  const id = input.id?.trim() || createId("subchg");
  if (changes.has(id)) throw new Error(`change already exists: ${id}`);

  const change: SubscriptionChange = {
    id,
    subscriptionId,
    kind: input.kind,
    fromPlanId: existing.planId,
    toPlanId,
    fromSeats: existing.seats,
    toSeats,
    detail: `kind=${input.kind} ${existing.planId}->${toPlanId}`,
    metadata: { ...(input.metadata ?? {}) },
    changedAt: nowIso(),
  };
  changes.set(id, change);
  return cloneChange(change);
}

export function getChange(id: string): SubscriptionChange | undefined {
  const change = changes.get(id.trim());
  return change ? cloneChange(change) : undefined;
}

export function listChanges(filter?: {
  subscriptionId?: string;
  kind?: ChangeKind;
}): SubscriptionChange[] {
  let result = [...changes.values()];
  if (filter?.subscriptionId) {
    const subscriptionId = filter.subscriptionId.trim();
    result = result.filter((c) => c.subscriptionId === subscriptionId);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChange);
}

export function clearChanges(): void {
  changes.clear();
}
