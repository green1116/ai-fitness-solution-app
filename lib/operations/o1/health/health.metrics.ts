/**
 * Operations O1 — Health metrics
 */

import { getCustomer } from "../customer/customer.registry";
import type {
  HealthMetrics,
  RecordHealthMetricsInput,
} from "./health.types";

const metrics = new Map<string, HealthMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cloneMetrics(entry: HealthMetrics): HealthMetrics {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function recordHealthMetrics(
  input: RecordHealthMetricsInput,
): HealthMetrics {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("health.customerId is required");
  if (!getCustomer(customerId)) {
    throw new Error(`customer not found: ${customerId}`);
  }
  if (!Number.isFinite(input.adoptionScore)) {
    throw new Error("health.adoptionScore must be a number");
  }
  if (!Number.isFinite(input.engagementScore)) {
    throw new Error("health.engagementScore must be a number");
  }
  if (!Number.isFinite(input.supportLoad) || input.supportLoad < 0) {
    throw new Error("health.supportLoad must be a non-negative number");
  }

  const id = input.id?.trim() || createId("o1met");
  if (metrics.has(id)) {
    throw new Error(`health metrics already exists: ${id}`);
  }

  const adoptionScore = clamp(input.adoptionScore);
  const engagementScore = clamp(input.engagementScore);
  const supportLoad = clamp(input.supportLoad);
  const entry: HealthMetrics = {
    id,
    customerId,
    adoptionScore,
    engagementScore,
    supportLoad,
    detail: `adoption=${adoptionScore} engagement=${engagementScore} support=${supportLoad}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  metrics.set(id, entry);
  return cloneMetrics(entry);
}

export function getHealthMetrics(id: string): HealthMetrics | undefined {
  const entry = metrics.get(id.trim());
  return entry ? cloneMetrics(entry) : undefined;
}

export function listHealthMetrics(filter?: {
  customerId?: string;
}): HealthMetrics[] {
  let result = [...metrics.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((m) => m.customerId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearHealthMetrics(): void {
  metrics.clear();
}
