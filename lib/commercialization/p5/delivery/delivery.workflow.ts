/**
 * Commercialization P5 — Delivery workflow
 */

import { DELIVERY_PHASES } from "./delivery.constants";
import {
  getDeliveryPlan,
  updateDeliveryPhase,
} from "./delivery.registry";
import type {
  AdvanceDeliveryInput,
  DeliveryPhase,
  DeliveryWorkflowEvent,
} from "./delivery.types";

const events = new Map<string, DeliveryWorkflowEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(
  event: DeliveryWorkflowEvent,
): DeliveryWorkflowEvent {
  return { ...event };
}

export function advanceDeliveryWorkflow(
  input: AdvanceDeliveryInput,
): DeliveryWorkflowEvent {
  const deliveryId = input.deliveryId.trim();
  const delivery = getDeliveryPlan(deliveryId);
  if (!delivery) throw new Error(`delivery plan not found: ${deliveryId}`);
  if (delivery.status === "FAILED" || delivery.status === "DELIVERED") {
    throw new Error(`cannot advance ${delivery.status} delivery`);
  }

  const phase = input.phase;
  if (!(DELIVERY_PHASES as readonly string[]).includes(phase)) {
    throw new Error(`invalid delivery phase: ${phase}`);
  }

  const previousPhase = delivery.phase;
  const completed = new Set(delivery.completedPhases);
  if (previousPhase !== phase) completed.add(previousPhase);
  completed.add(phase);
  const completedPhases = DELIVERY_PHASES.filter((p) => completed.has(p));

  const isDone =
    phase === "CLOSEOUT" &&
    completedPhases.length === DELIVERY_PHASES.length;
  const status = isDone
    ? "DELIVERED"
    : completedPhases.length > 0
      ? "IN_FLIGHT"
      : "SCHEDULED";

  updateDeliveryPhase(deliveryId, phase, completedPhases, status);

  const id = input.id?.trim() || createId("dwf");
  if (events.has(id)) {
    throw new Error(`delivery workflow event already exists: ${id}`);
  }

  const event: DeliveryWorkflowEvent = {
    id,
    deliveryId,
    phase,
    previousPhase,
    note: (input.note ?? `advanced ${previousPhase}→${phase}`).trim(),
    advancedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getDeliveryWorkflowEvent(
  id: string,
): DeliveryWorkflowEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listDeliveryWorkflowEvents(filter?: {
  deliveryId?: string;
  phase?: DeliveryPhase;
}): DeliveryWorkflowEvent[] {
  let result = [...events.values()];
  if (filter?.deliveryId) {
    const did = filter.deliveryId.trim();
    result = result.filter((e) => e.deliveryId === did);
  }
  if (filter?.phase) result = result.filter((e) => e.phase === filter.phase);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearDeliveryWorkflowEvents(): void {
  events.clear();
}
