/**
 * Product P9 — Customer health registry
 */

import { HEALTH_STATUSES } from "./health.constants";
import type {
  CreateCustomerHealthInput,
  CustomerHealth,
  HealthStatus,
  UpdateCustomerHealthInput,
} from "./health.types";

const healthRecords = new Map<string, CustomerHealth>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreToStatus(score: number): HealthStatus {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "WATCH";
  if (score >= 40) return "AT_RISK";
  if (score >= 0) return "CRITICAL";
  return "UNKNOWN";
}

function cloneHealth(health: CustomerHealth): CustomerHealth {
  return { ...health, metadata: { ...health.metadata } };
}

export function createCustomerHealth(
  input: CreateCustomerHealthInput,
): CustomerHealth {
  const accountRef = input.accountRef.trim();
  const tenderRef = input.tenderRef.trim();
  const owner = input.owner.trim();
  if (!accountRef) throw new Error("health.accountRef is required");
  if (!tenderRef) throw new Error("health.tenderRef is required");
  if (!owner) throw new Error("health.owner is required");
  if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
    throw new Error("health.score must be between 0 and 100");
  }

  const id = input.id?.trim() || createId("p9hlt");
  if (healthRecords.has(id)) {
    throw new Error(`customer health already exists: ${id}`);
  }

  const now = nowIso();
  const status = scoreToStatus(input.score);
  const health: CustomerHealth = {
    id,
    accountRef,
    tenderRef,
    score: input.score,
    status,
    owner,
    detail: `status=${status} score=${input.score}`,
    metadata: { ...(input.metadata ?? {}) },
    assessedAt: now,
    updatedAt: now,
  };
  healthRecords.set(id, health);
  return cloneHealth(health);
}

export function updateCustomerHealth(
  input: UpdateCustomerHealthInput,
): CustomerHealth {
  const healthId = input.healthId.trim();
  if (!healthId) throw new Error("health.healthId is required");
  const existing = healthRecords.get(healthId);
  if (!existing) throw new Error(`customer health not found: ${healthId}`);

  const score =
    input.score !== undefined ? input.score : existing.score;
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("health.score must be between 0 and 100");
  }
  if (
    input.status !== undefined &&
    !(HEALTH_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid health status: ${input.status}`);
  }

  const status = input.status ?? scoreToStatus(score);
  const updated: CustomerHealth = {
    ...existing,
    score,
    status,
    detail: `status=${status} score=${score}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  healthRecords.set(healthId, updated);
  return cloneHealth(updated);
}

export function getCustomerHealth(id: string): CustomerHealth | undefined {
  const health = healthRecords.get(id.trim());
  return health ? cloneHealth(health) : undefined;
}

export function listCustomerHealth(filter?: {
  accountRef?: string;
  status?: HealthStatus;
}): CustomerHealth[] {
  let result = [...healthRecords.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((h) => h.accountRef === aref);
  }
  if (filter?.status) result = result.filter((h) => h.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHealth);
}

export function clearCustomerHealth(): void {
  healthRecords.clear();
}
