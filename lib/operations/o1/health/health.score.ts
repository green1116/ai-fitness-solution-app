/**
 * Operations O1 — Health score
 */

import { HEALTH_BANDS } from "../success/success.constants";
import { getHealthMetrics, listHealthMetrics } from "./health.metrics";
import type {
  HealthBand,
  HealthScore,
  ScoreCustomerHealthInput,
} from "./health.types";

const scores = new Map<string, HealthScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreToBand(score: number): HealthBand {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 55) return "FAIR";
  if (score >= 40) return "POOR";
  return "CRITICAL";
}

function cloneScore(score: HealthScore): HealthScore {
  return { ...score };
}

export function scoreCustomerHealth(
  input: ScoreCustomerHealthInput,
): HealthScore {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("healthScore.customerId is required");

  const metrics = input.metricsId
    ? getHealthMetrics(input.metricsId)
    : listHealthMetrics({ customerId }).sort((a, b) =>
        b.recordedAt.localeCompare(a.recordedAt),
      )[0];
  if (!metrics || metrics.customerId !== customerId) {
    throw new Error(`health metrics not found for customer: ${customerId}`);
  }

  const raw =
    metrics.adoptionScore * 0.4 +
    metrics.engagementScore * 0.4 +
    (100 - metrics.supportLoad) * 0.2;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const band = scoreToBand(score);
  if (!(HEALTH_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid health band: ${band}`);
  }

  const id = input.id?.trim() || createId("o1hlt");
  if (scores.has(id)) {
    throw new Error(`health score already exists: ${id}`);
  }

  const entry: HealthScore = {
    id,
    customerId,
    metricsId: metrics.id,
    score,
    band,
    detail: `score=${score} band=${band}`,
    scoredAt: nowIso(),
  };
  scores.set(id, entry);
  return cloneScore(entry);
}

export function getHealthScore(id: string): HealthScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listHealthScores(filter?: {
  customerId?: string;
  band?: HealthBand;
}): HealthScore[] {
  let result = [...scores.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((s) => s.customerId === cid);
  }
  if (filter?.band) result = result.filter((s) => s.band === filter.band);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearHealthScores(): void {
  scores.clear();
}
