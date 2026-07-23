/**
 * Operations O2 — Value score
 */

import { VALUE_BANDS } from "../usage/usage.constants";
import { getValueMetrics, listValueMetrics } from "./value.metrics";
import type {
  ScoreAccountValueInput,
  ValueBand,
  ValueScore,
} from "./value.types";

const scores = new Map<string, ValueScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreToBand(score: number): ValueBand {
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score >= 25) return "LOW";
  return "DORMANT";
}

function cloneScore(score: ValueScore): ValueScore {
  return { ...score };
}

export function scoreAccountValue(
  input: ScoreAccountValueInput,
): ValueScore {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("valueScore.accountRef is required");

  const metrics = input.metricsId
    ? getValueMetrics(input.metricsId)
    : listValueMetrics({ accountRef }).sort((a, b) =>
        b.recordedAt.localeCompare(a.recordedAt),
      )[0];
  if (!metrics || metrics.accountRef !== accountRef) {
    throw new Error(`value metrics not found for account: ${accountRef}`);
  }

  const usageComponent = Math.min(100, metrics.usageUnits);
  const raw =
    usageComponent * 0.3 +
    metrics.adoptionRate * 0.4 +
    metrics.activityIntensity * 0.3;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const band = scoreToBand(score);
  if (!(VALUE_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid value band: ${band}`);
  }

  const id = input.id?.trim() || createId("o2vsc");
  if (scores.has(id)) {
    throw new Error(`value score already exists: ${id}`);
  }

  const entry: ValueScore = {
    id,
    accountRef,
    metricsId: metrics.id,
    score,
    band,
    detail: `score=${score} band=${band}`,
    scoredAt: nowIso(),
  };
  scores.set(id, entry);
  return cloneScore(entry);
}

export function getValueScore(id: string): ValueScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listValueScores(filter?: {
  accountRef?: string;
  band?: ValueBand;
}): ValueScore[] {
  let result = [...scores.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  if (filter?.band) result = result.filter((s) => s.band === filter.band);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearValueScores(): void {
  scores.clear();
}
