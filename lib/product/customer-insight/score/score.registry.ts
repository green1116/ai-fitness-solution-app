/**
 * Product Customer Insight — Score registry
 */

import { INSIGHT_SCORE_KINDS } from "../insight/insight.constants";
import type {
  ComputeScoreInput,
  CustomerInsightScore,
  InsightScoreKind,
} from "./score.types";

const scores = new Map<string, CustomerInsightScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScore(score: CustomerInsightScore): CustomerInsightScore {
  return { ...score, metadata: { ...score.metadata } };
}

export function computeScore(input: ComputeScoreInput): CustomerInsightScore {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("score.customerId is required");
  if (!(INSIGHT_SCORE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid insight score kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.value) || input.value < 0 || input.value > 100) {
    throw new Error("score.value must be between 0 and 100");
  }

  const existing = [...scores.values()].find(
    (s) => s.customerId === customerId && s.kind === input.kind,
  );
  const id = input.id?.trim() || existing?.id || createId("cinscr");
  if (scores.has(id) && existing && existing.id !== id) {
    throw new Error(`insight score already exists: ${id}`);
  }

  const score: CustomerInsightScore = {
    id,
    customerId,
    kind: input.kind,
    value: input.value,
    detail: `kind=${input.kind} value=${input.value}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    scoredAt: nowIso(),
  };
  scores.set(id, score);
  return cloneScore(score);
}

export function getScore(id: string): CustomerInsightScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listScores(filter?: {
  customerId?: string;
  kind?: InsightScoreKind;
}): CustomerInsightScore[] {
  let result = [...scores.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((s) => s.customerId === customerId);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearScores(): void {
  scores.clear();
}
