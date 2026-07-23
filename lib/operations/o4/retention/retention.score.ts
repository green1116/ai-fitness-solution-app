/**
 * Operations O4 — Retention score
 */

import { RETENTION_BANDS } from "../growth/growth.constants";
import type {
  RetentionBand,
  RetentionScore,
  ScoreRetentionInput,
} from "./retention.types";

const scores = new Map<string, RetentionScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function scoreToBand(score: number): RetentionBand {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "HEALTHY";
  if (score >= 50) return "AT_RISK";
  return "CHURNING";
}

function cloneScore(score: RetentionScore): RetentionScore {
  return { ...score, metadata: { ...score.metadata } };
}

export function scoreRetention(
  input: ScoreRetentionInput,
): RetentionScore {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("retention.accountRef is required");
  if (!Number.isFinite(input.retainedUsers) || input.retainedUsers < 0) {
    throw new Error("retention.retainedUsers must be a non-negative number");
  }
  if (!Number.isFinite(input.startingUsers) || input.startingUsers <= 0) {
    throw new Error("retention.startingUsers must be a positive number");
  }
  if (input.retainedUsers > input.startingUsers) {
    throw new Error("retention.retainedUsers cannot exceed startingUsers");
  }

  const retainedUsers = Math.round(input.retainedUsers);
  const startingUsers = Math.round(input.startingUsers);
  const score = Math.round((retainedUsers / startingUsers) * 100);
  const band = scoreToBand(score);
  if (!(RETENTION_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid retention band: ${band}`);
  }

  const id = input.id?.trim() || createId("o4rsc");
  if (scores.has(id)) {
    throw new Error(`retention score already exists: ${id}`);
  }

  const entry: RetentionScore = {
    id,
    accountRef,
    score,
    band,
    retainedUsers,
    startingUsers,
    detail: `score=${score} band=${band}`,
    metadata: { ...(input.metadata ?? {}) },
    scoredAt: nowIso(),
  };
  scores.set(id, entry);
  return cloneScore(entry);
}

export function getRetentionScore(id: string): RetentionScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listRetentionScores(filter?: {
  accountRef?: string;
  band?: RetentionBand;
}): RetentionScore[] {
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

export function clearRetentionScores(): void {
  scores.clear();
}
