/**
 * Product Relationship — Lifecycle registry
 */

import { getBond, updateBondStatus } from "../bond/bond.registry";
import type {
  RelationshipLifecycleEvent,
  TransitionBondLifecycleInput,
} from "./lifecycle.types";

const lifecycleEvents = new Map<string, RelationshipLifecycleEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLifecycle(
  event: RelationshipLifecycleEvent,
): RelationshipLifecycleEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function transitionBondLifecycle(
  input: TransitionBondLifecycleInput,
): RelationshipLifecycleEvent {
  const bondId = input.bondId.trim();
  if (!bondId) throw new Error("lifecycle.bondId is required");

  const bond = getBond(bondId);
  if (!bond) throw new Error(`bond not found: ${bondId}`);
  if (bond.status === input.toStatus) {
    throw new Error(`bond already ${input.toStatus}: ${bondId}`);
  }

  const fromStatus = bond.status;
  updateBondStatus({ bondId, status: input.toStatus });

  const id = input.id?.trim() || createId("rellfc");
  if (lifecycleEvents.has(id)) {
    throw new Error(`lifecycle event already exists: ${id}`);
  }

  const event: RelationshipLifecycleEvent = {
    id,
    bondId,
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
): RelationshipLifecycleEvent | undefined {
  const event = lifecycleEvents.get(id.trim());
  return event ? cloneLifecycle(event) : undefined;
}

export function listLifecycleEvents(filter?: {
  bondId?: string;
}): RelationshipLifecycleEvent[] {
  let result = [...lifecycleEvents.values()];
  if (filter?.bondId) {
    const bondId = filter.bondId.trim();
    result = result.filter((e) => e.bondId === bondId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLifecycle);
}

export function clearLifecycleEvents(): void {
  lifecycleEvents.clear();
}
