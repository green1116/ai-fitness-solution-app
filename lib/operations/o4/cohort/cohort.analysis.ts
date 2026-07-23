/**
 * Operations O4 — Cohort analysis
 */

import { COHORT_PERIODS } from "../growth/growth.constants";
import type {
  AnalyzeCohortInput,
  CohortAnalysis,
  CohortPeriod,
} from "./cohort.types";

const analyses = new Map<string, CohortAnalysis>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalysis(entry: CohortAnalysis): CohortAnalysis {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function analyzeCohort(input: AnalyzeCohortInput): CohortAnalysis {
  const accountRef = input.accountRef.trim();
  const cohortLabel = input.cohortLabel.trim();
  if (!accountRef) throw new Error("cohort.accountRef is required");
  if (!cohortLabel) throw new Error("cohort.cohortLabel is required");
  if (!(COHORT_PERIODS as readonly string[]).includes(input.period)) {
    throw new Error(`invalid cohort period: ${input.period}`);
  }
  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new Error("cohort.size must be a positive number");
  }
  if (!Number.isFinite(input.retainedCount) || input.retainedCount < 0) {
    throw new Error("cohort.retainedCount must be a non-negative number");
  }
  if (input.retainedCount > input.size) {
    throw new Error("cohort.retainedCount cannot exceed size");
  }

  const size = Math.round(input.size);
  const retainedCount = Math.round(input.retainedCount);
  const retainedRate = Math.round((retainedCount / size) * 100);

  const id = input.id?.trim() || createId("o4coh");
  if (analyses.has(id)) {
    throw new Error(`cohort analysis already exists: ${id}`);
  }

  const entry: CohortAnalysis = {
    id,
    accountRef,
    period: input.period,
    cohortLabel,
    size,
    retainedRate,
    detail: `label=${cohortLabel} rate=${retainedRate}`,
    metadata: { ...(input.metadata ?? {}) },
    analyzedAt: nowIso(),
  };
  analyses.set(id, entry);
  return cloneAnalysis(entry);
}

export function getCohortAnalysis(id: string): CohortAnalysis | undefined {
  const entry = analyses.get(id.trim());
  return entry ? cloneAnalysis(entry) : undefined;
}

export function listCohortAnalyses(filter?: {
  accountRef?: string;
  period?: CohortPeriod;
}): CohortAnalysis[] {
  let result = [...analyses.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((a) => a.accountRef === aref);
  }
  if (filter?.period) {
    result = result.filter((a) => a.period === filter.period);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalysis);
}

export function clearCohortAnalyses(): void {
  analyses.clear();
}
