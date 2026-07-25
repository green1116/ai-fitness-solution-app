/**
 * Product P9 — Satisfaction registry
 */

import { getCustomerHealth } from "../customer-health/health.registry";
import type {
  CreateSatisfactionInput,
  SatisfactionLevel,
  SatisfactionScore,
} from "./satisfaction.types";

const satisfactionRecords = new Map<string, SatisfactionScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function csatToLevel(csat: number): SatisfactionLevel {
  if (csat >= 90) return "VERY_HIGH";
  if (csat >= 75) return "HIGH";
  if (csat >= 50) return "NEUTRAL";
  if (csat >= 25) return "LOW";
  return "VERY_LOW";
}

function cloneSatisfaction(score: SatisfactionScore): SatisfactionScore {
  return { ...score, metadata: { ...score.metadata } };
}

export function createSatisfaction(
  input: CreateSatisfactionInput,
): SatisfactionScore {
  const healthId = input.healthId.trim();
  if (!healthId) throw new Error("satisfaction.healthId is required");
  if (!Number.isFinite(input.csat) || input.csat < 0 || input.csat > 100) {
    throw new Error("satisfaction.csat must be between 0 and 100");
  }
  if (!Number.isFinite(input.nps) || input.nps < -100 || input.nps > 100) {
    throw new Error("satisfaction.nps must be between -100 and 100");
  }
  if (!getCustomerHealth(healthId)) {
    throw new Error(`customer health not found: ${healthId}`);
  }

  const id = input.id?.trim() || createId("p9sat");
  if (satisfactionRecords.has(id)) {
    throw new Error(`satisfaction score already exists: ${id}`);
  }

  const level = csatToLevel(input.csat);
  const score: SatisfactionScore = {
    id,
    healthId,
    level,
    csat: input.csat,
    nps: input.nps,
    detail: `level=${level} csat=${input.csat} nps=${input.nps}`,
    metadata: { ...(input.metadata ?? {}) },
    measuredAt: nowIso(),
  };
  satisfactionRecords.set(id, score);
  return cloneSatisfaction(score);
}

export function getSatisfaction(id: string): SatisfactionScore | undefined {
  const score = satisfactionRecords.get(id.trim());
  return score ? cloneSatisfaction(score) : undefined;
}

export function listSatisfaction(filter?: {
  healthId?: string;
  level?: SatisfactionLevel;
}): SatisfactionScore[] {
  let result = [...satisfactionRecords.values()];
  if (filter?.healthId) {
    const hid = filter.healthId.trim();
    result = result.filter((s) => s.healthId === hid);
  }
  if (filter?.level) result = result.filter((s) => s.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSatisfaction);
}

export function clearSatisfaction(): void {
  satisfactionRecords.clear();
}
