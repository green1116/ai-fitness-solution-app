/**
 * Commercialization P5 — Delivery registry
 */

import {
  DELIVERY_PHASES,
  DELIVERY_STATUSES,
} from "./delivery.constants";
import { getDeliveryProject } from "../project/project.registry";
import type {
  DeliveryPhase,
  DeliveryPlan,
  DeliveryStatus,
  RegisterDeliveryInput,
} from "./delivery.types";

const deliveries = new Map<string, DeliveryPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDelivery(delivery: DeliveryPlan): DeliveryPlan {
  return {
    ...delivery,
    completedPhases: [...delivery.completedPhases],
    metadata: { ...delivery.metadata },
  };
}

export function registerDelivery(
  input: RegisterDeliveryInput,
): DeliveryPlan {
  const name = input.name.trim();
  const projectId = input.projectId.trim();
  if (!name) throw new Error("delivery.name is required");

  const project = getDeliveryProject(projectId);
  if (!project) throw new Error(`project not found: ${projectId}`);
  if (project.status === "CANCELLED") {
    throw new Error(`cannot deliver cancelled project: ${projectId}`);
  }

  const id = input.id?.trim() || createId("deliv");
  if (deliveries.has(id)) {
    throw new Error(`delivery plan already exists: ${id}`);
  }

  const status: DeliveryStatus = "DRAFT";
  const phase: DeliveryPhase = "KICKOFF";
  if (!(DELIVERY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid delivery status: ${status}`);
  }
  if (!(DELIVERY_PHASES as readonly string[]).includes(phase)) {
    throw new Error(`invalid delivery phase: ${phase}`);
  }

  const now = nowIso();
  const delivery: DeliveryPlan = {
    id,
    projectId,
    name,
    status,
    phase,
    completedPhases: [],
    detail: `status=${status} phase=${phase}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  deliveries.set(id, delivery);
  return cloneDelivery(delivery);
}

export function updateDeliveryPhase(
  id: string,
  phase: DeliveryPhase,
  completedPhases: DeliveryPhase[],
  status: DeliveryStatus,
): DeliveryPlan {
  const delivery = deliveries.get(id.trim());
  if (!delivery) throw new Error(`delivery plan not found: ${id}`);
  delivery.phase = phase;
  delivery.completedPhases = [...completedPhases];
  delivery.status = status;
  if (status === "DELIVERED") delivery.deliveredAt = nowIso();
  delivery.updatedAt = nowIso();
  delivery.detail = `status=${status} phase=${phase}`;
  deliveries.set(delivery.id, delivery);
  return cloneDelivery(delivery);
}

export function getDeliveryPlan(id: string): DeliveryPlan | undefined {
  const delivery = deliveries.get(id.trim());
  return delivery ? cloneDelivery(delivery) : undefined;
}

export function listDeliveryPlans(filter?: {
  projectId?: string;
  status?: DeliveryStatus;
}): DeliveryPlan[] {
  let result = [...deliveries.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((d) => d.projectId === pid);
  }
  if (filter?.status) result = result.filter((d) => d.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDelivery);
}

export function clearDeliveryPlans(): void {
  deliveries.clear();
}
