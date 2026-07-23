/**
 * Operations O4 — Retention analysis
 */

import { getRetentionScore, listRetentionScores } from "./retention.score";
import type {
  AnalyzeRetentionInput,
  RetentionAnalysis,
} from "./retention.types";

const analyses = new Map<string, RetentionAnalysis>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalysis(entry: RetentionAnalysis): RetentionAnalysis {
  return { ...entry, riskFlags: [...entry.riskFlags] };
}

export function analyzeRetention(
  input: AnalyzeRetentionInput,
): RetentionAnalysis {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("retentionAnalysis.accountRef is required");

  const score = input.scoreId
    ? getRetentionScore(input.scoreId)
    : listRetentionScores({ accountRef }).sort((a, b) =>
        b.scoredAt.localeCompare(a.scoredAt),
      )[0];
  if (!score || score.accountRef !== accountRef) {
    throw new Error(`retention score not found for account: ${accountRef}`);
  }

  const riskFlags: string[] = [];
  if (score.band === "AT_RISK" || score.band === "CHURNING") {
    riskFlags.push(`band=${score.band}`);
  }
  if (score.score < 70) riskFlags.push("below-healthy-threshold");

  const recommendation =
    score.band === "EXCELLENT" || score.band === "HEALTHY"
      ? "Maintain engagement programs"
      : "Trigger retention playbook";

  const id = input.id?.trim() || createId("o4ran");
  if (analyses.has(id)) {
    throw new Error(`retention analysis already exists: ${id}`);
  }

  const entry: RetentionAnalysis = {
    id,
    accountRef,
    scoreId: score.id,
    riskFlags,
    recommendation,
    detail: `band=${score.band} flags=${riskFlags.length}`,
    analyzedAt: nowIso(),
  };
  analyses.set(id, entry);
  return cloneAnalysis(entry);
}

export function getRetentionAnalysis(
  id: string,
): RetentionAnalysis | undefined {
  const entry = analyses.get(id.trim());
  return entry ? cloneAnalysis(entry) : undefined;
}

export function listRetentionAnalyses(filter?: {
  accountRef?: string;
}): RetentionAnalysis[] {
  let result = [...analyses.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((a) => a.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalysis);
}

export function clearRetentionAnalyses(): void {
  analyses.clear();
}
