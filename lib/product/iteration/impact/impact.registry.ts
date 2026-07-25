/**
 * Product Iteration — Impact registry
 */

import { getCycle } from "../cycle/cycle.registry";
import type {
  ImpactBand,
  ImpactScore,
  ScoreImpactInput,
} from "./impact.types";

const scores = new Map<string, ImpactScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreToBand(score: number): ImpactBand {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function cloneScore(score: ImpactScore): ImpactScore {
  return { ...score, metadata: { ...score.metadata } };
}

export function scoreImpact(input: ScoreImpactInput): ImpactScore {
  const cycleId = input.cycleId.trim();
  const subjectRef = input.subjectRef.trim();
  if (!cycleId) throw new Error("impact.cycleId is required");
  if (!subjectRef) throw new Error("impact.subjectRef is required");
  if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
    throw new Error("impact.score must be between 0 and 100");
  }
  if (!getCycle(cycleId)) throw new Error(`cycle not found: ${cycleId}`);

  const id = input.id?.trim() || createId("iterimp");
  if (scores.has(id)) throw new Error(`impact score already exists: ${id}`);

  const band = scoreToBand(input.score);
  const score: ImpactScore = {
    id,
    cycleId,
    subjectRef,
    score: input.score,
    band,
    detail: `band=${band} score=${input.score}`,
    metadata: { ...(input.metadata ?? {}) },
    scoredAt: nowIso(),
  };
  scores.set(id, score);
  return cloneScore(score);
}

export function getImpact(id: string): ImpactScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listImpact(filter?: {
  cycleId?: string;
}): ImpactScore[] {
  let result = [...scores.values()];
  if (filter?.cycleId) {
    const cid = filter.cycleId.trim();
    result = result.filter((s) => s.cycleId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearImpact(): void {
  scores.clear();
}
