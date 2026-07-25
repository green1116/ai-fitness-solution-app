/**
 * Product Customer — Lifecycle registry
 */

import {
  getCustomer,
  updateCustomerStatus,
} from "../profile/profile.registry";
import type {
  CustomerLifecycleEvent,
  TransitionLifecycleInput,
} from "./lifecycle.types";

const lifecycleEvents = new Map<string, CustomerLifecycleEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLifecycle(
  event: CustomerLifecycleEvent,
): CustomerLifecycleEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function transitionLifecycle(
  input: TransitionLifecycleInput,
): CustomerLifecycleEvent {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("lifecycle.customerId is required");

  const customer = getCustomer(customerId);
  if (!customer) throw new Error(`customer not found: ${customerId}`);
  if (customer.status === input.toStatus) {
    throw new Error(`customer already ${input.toStatus}: ${customerId}`);
  }

  const fromStatus = customer.status;
  updateCustomerStatus({ customerId, status: input.toStatus });

  const id = input.id?.trim() || createId("cuslfc");
  if (lifecycleEvents.has(id)) {
    throw new Error(`lifecycle event already exists: ${id}`);
  }

  const event: CustomerLifecycleEvent = {
    id,
    customerId,
    fromStatus,
    toStatus: input.toStatus,
    detail: `${fromStatus}->${input.toStatus}`,
    metadata: { ...(input.metadata ?? {}) },
    transitionedAt: nowIso(),
  };
  lifecycleEvents.set(id, event);
  return cloneLifecycle(event);
}

export function getLifecycleEvent(
  id: string,
): CustomerLifecycleEvent | undefined {
  const event = lifecycleEvents.get(id.trim());
  return event ? cloneLifecycle(event) : undefined;
}

export function listLifecycleEvents(filter?: {
  customerId?: string;
}): CustomerLifecycleEvent[] {
  let result = [...lifecycleEvents.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((e) => e.customerId === customerId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLifecycle);
}

export function clearLifecycleEvents(): void {
  lifecycleEvents.clear();
}
