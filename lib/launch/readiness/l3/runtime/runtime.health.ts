/**
 * Launch L3 — Runtime health
 */

import { HEALTH_LEVELS } from "./runtime.constants";
import { getRuntime } from "./runtime.status";
import type {
  AssessRuntimeHealthInput,
  HealthLevel,
  RuntimeHealth,
} from "./runtime.types";

const healthRecords = new Map<string, RuntimeHealth>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreToLevel(score: number): HealthLevel {
  if (score >= 90) return "GREEN";
  if (score >= 70) return "YELLOW";
  if (score >= 40) return "ORANGE";
  return "RED";
}

function cloneHealth(health: RuntimeHealth): RuntimeHealth {
  return { ...health };
}

export function assessRuntimeHealth(
  input: AssessRuntimeHealthInput,
): RuntimeHealth {
  const runtimeId = input.runtimeId.trim();
  if (!runtimeId) throw new Error("health.runtimeId is required");
  if (!getRuntime(runtimeId)) {
    throw new Error(`runtime not found: ${runtimeId}`);
  }
  if (!Number.isFinite(input.checksPassed) || input.checksPassed < 0) {
    throw new Error("health.checksPassed must be non-negative");
  }
  if (!Number.isFinite(input.checksFailed) || input.checksFailed < 0) {
    throw new Error("health.checksFailed must be non-negative");
  }

  const checksPassed = Math.round(input.checksPassed);
  const checksFailed = Math.round(input.checksFailed);
  const total = checksPassed + checksFailed;
  const score =
    total === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((checksPassed / total) * 100)));
  const level = scoreToLevel(score);
  if (!(HEALTH_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid health level: ${level}`);
  }

  const id = input.id?.trim() || createId("l3hlt");
  if (healthRecords.has(id)) {
    throw new Error(`runtime health already exists: ${id}`);
  }

  const health: RuntimeHealth = {
    id,
    runtimeId,
    level,
    score,
    checksPassed,
    checksFailed,
    detail: `level=${level} score=${score}`,
    assessedAt: nowIso(),
  };
  healthRecords.set(id, health);
  return cloneHealth(health);
}

export function getRuntimeHealth(id: string): RuntimeHealth | undefined {
  const health = healthRecords.get(id.trim());
  return health ? cloneHealth(health) : undefined;
}

export function listRuntimeHealth(filter?: {
  runtimeId?: string;
  level?: HealthLevel;
}): RuntimeHealth[] {
  let result = [...healthRecords.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((h) => h.runtimeId === rid);
  }
  if (filter?.level) result = result.filter((h) => h.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHealth);
}

export function clearRuntimeHealth(): void {
  healthRecords.clear();
}
