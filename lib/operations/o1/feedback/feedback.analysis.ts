/**
 * Operations O1 — Feedback analysis
 */

import { listFeedbackEntries } from "./feedback.collector";
import type {
  AnalyzeFeedbackInput,
  FeedbackAnalysis,
} from "./feedback.types";

const analyses = new Map<string, FeedbackAnalysis>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalysis(analysis: FeedbackAnalysis): FeedbackAnalysis {
  return { ...analysis };
}

export function analyzeFeedback(
  input: AnalyzeFeedbackInput,
): FeedbackAnalysis {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("feedbackAnalysis.customerId is required");

  const entries = listFeedbackEntries({ customerId });
  if (entries.length < 1) {
    throw new Error(`no feedback entries for customer: ${customerId}`);
  }

  const sum = entries.reduce((acc, e) => acc + e.rating, 0);
  const averageRating = Math.round((sum / entries.length) * 10) / 10;
  const sentiment =
    averageRating >= 8
      ? "POSITIVE"
      : averageRating >= 5
        ? "NEUTRAL"
        : ("NEGATIVE" as const);

  const id = input.id?.trim() || createId("o1anl");
  if (analyses.has(id)) {
    throw new Error(`feedback analysis already exists: ${id}`);
  }

  const analysis: FeedbackAnalysis = {
    id,
    customerId,
    entryCount: entries.length,
    averageRating,
    sentiment,
    detail: `avg=${averageRating} sentiment=${sentiment} entries=${entries.length}`,
    analyzedAt: nowIso(),
  };
  analyses.set(id, analysis);
  return cloneAnalysis(analysis);
}

export function getFeedbackAnalysis(
  id: string,
): FeedbackAnalysis | undefined {
  const analysis = analyses.get(id.trim());
  return analysis ? cloneAnalysis(analysis) : undefined;
}

export function listFeedbackAnalyses(filter?: {
  customerId?: string;
}): FeedbackAnalysis[] {
  let result = [...analyses.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((a) => a.customerId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalysis);
}

export function clearFeedbackAnalyses(): void {
  analyses.clear();
}
