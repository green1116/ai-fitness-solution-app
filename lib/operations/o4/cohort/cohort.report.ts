/**
 * Operations O4 — Cohort report
 */

import { listCohortAnalyses } from "./cohort.analysis";
import type {
  CohortReport,
  GenerateCohortReportInput,
} from "./cohort.types";

const reports = new Map<string, CohortReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(report: CohortReport): CohortReport {
  return { ...report, highlights: [...report.highlights] };
}

export function generateCohortReport(
  input: GenerateCohortReportInput,
): CohortReport {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("cohortReport.accountRef is required");

  const analyses = listCohortAnalyses({ accountRef });
  if (analyses.length < 1) {
    throw new Error(`no cohort analyses for account: ${accountRef}`);
  }

  const averageRetainedRate = Math.round(
    analyses.reduce((sum, a) => sum + a.retainedRate, 0) / analyses.length,
  );
  const highlights = [
    `analyses=${analyses.length}`,
    `avgRetained=${averageRetainedRate}`,
    `latest=${analyses[analyses.length - 1]?.cohortLabel ?? "n/a"}`,
  ];

  const id = input.id?.trim() || createId("o4crep");
  if (reports.has(id)) {
    throw new Error(`cohort report already exists: ${id}`);
  }

  const title =
    (input.title ?? "").trim() || `Cohort Report — ${accountRef}`;
  const report: CohortReport = {
    id,
    title,
    accountRef,
    analysisCount: analyses.length,
    averageRetainedRate,
    highlights,
    detail: `analyses=${analyses.length} avg=${averageRetainedRate}`,
    generatedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getCohortReport(id: string): CohortReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listCohortReports(filter?: {
  accountRef?: string;
}): CohortReport[] {
  let result = [...reports.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((r) => r.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReport);
}

export function clearCohortReports(): void {
  reports.clear();
}
