/**
 * Launch L2 — Feedback score
 */

import { listFeedbackEntries } from "./feedback.collector";
import type { FeedbackScore, ScoreFeedbackInput } from "./feedback.types";

const scores = new Map<string, FeedbackScore>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScore(score: FeedbackScore): FeedbackScore {
  return { ...score };
}

export function scorePilotFeedback(
  input: ScoreFeedbackInput,
): FeedbackScore {
  const pilotId = input.pilotId.trim();
  if (!pilotId) throw new Error("feedbackScore.pilotId is required");

  const entries = listFeedbackEntries({ pilotId });
  if (entries.length < 1) {
    throw new Error(`no feedback entries for pilot: ${pilotId}`);
  }

  const sum = entries.reduce((acc, e) => acc + e.rating, 0);
  const averageRating = Math.round((sum / entries.length) * 10) / 10;
  const promoters = entries.filter((e) => e.rating >= 9).length;
  const detractors = entries.filter((e) => e.rating <= 6).length;
  const npsProxy = Math.round(
    ((promoters - detractors) / entries.length) * 100,
  );

  const id = input.id?.trim() || createId("l2scr");
  if (scores.has(id)) {
    throw new Error(`feedback score already exists: ${id}`);
  }

  const score: FeedbackScore = {
    id,
    pilotId,
    entryCount: entries.length,
    averageRating,
    npsProxy,
    detail: `avg=${averageRating} nps=${npsProxy} entries=${entries.length}`,
    scoredAt: nowIso(),
  };
  scores.set(id, score);
  return cloneScore(score);
}

export function getFeedbackScore(id: string): FeedbackScore | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listFeedbackScores(filter?: {
  pilotId?: string;
}): FeedbackScore[] {
  let result = [...scores.values()];
  if (filter?.pilotId) {
    const pid = filter.pilotId.trim();
    result = result.filter((s) => s.pilotId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearFeedbackScores(): void {
  scores.clear();
}
