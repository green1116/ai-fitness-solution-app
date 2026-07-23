/**
 * Operations O2 — Report generator
 */

import { listActivityAnalytics } from "../activity/activity.analytics";
import { listFeatureMetrics } from "../feature/feature.metrics";
import { REPORT_KINDS } from "../usage/usage.constants";
import { listUsageTracking } from "../usage/usage.tracking";
import { listValueScores } from "../value/value.score";
import type {
  GenerateUsageReportInput,
  UsageIntelligenceReport,
} from "./report.types";

const reports = new Map<string, UsageIntelligenceReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(report: UsageIntelligenceReport): UsageIntelligenceReport {
  return { ...report, highlights: [...report.highlights] };
}

export function generateUsageReport(
  input: GenerateUsageReportInput,
): UsageIntelligenceReport {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("report.accountRef is required");
  if (!(REPORT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid report kind: ${input.kind}`);
  }

  const tracking = listUsageTracking();
  const featureMetrics = listFeatureMetrics({ accountRef });
  const analytics = listActivityAnalytics({ accountRef });
  const values = listValueScores({ accountRef });

  if (
    tracking.length < 1 &&
    featureMetrics.length < 1 &&
    analytics.length < 1 &&
    values.length < 1
  ) {
    throw new Error(`insufficient usage intelligence for: ${accountRef}`);
  }

  const overallScore = Math.round(
    ((featureMetrics[0]?.adoptionRate ?? 0) +
      (analytics[0]?.intensityScore ?? 0) +
      (values[0]?.score ?? 0)) /
      3,
  );

  const highlights = [
    `tracking=${tracking.length}`,
    `adoptionRate=${featureMetrics[0]?.adoptionRate ?? 0}`,
    `intensity=${analytics[0]?.intensityScore ?? 0}`,
    `value=${values[0]?.band ?? "DORMANT"}`,
  ];

  const id = input.id?.trim() || createId("o2rep");
  if (reports.has(id)) {
    throw new Error(`usage report already exists: ${id}`);
  }

  const title =
    (input.title ?? "").trim() ||
    `${input.kind} Usage Intelligence — ${accountRef}`;
  const report: UsageIntelligenceReport = {
    id,
    kind: input.kind,
    title,
    accountRef,
    highlights,
    overallScore,
    detail: `kind=${input.kind} score=${overallScore}`,
    generatedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getUsageReport(
  id: string,
): UsageIntelligenceReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listUsageReports(filter?: {
  accountRef?: string;
}): UsageIntelligenceReport[] {
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

export function clearUsageReports(): void {
  reports.clear();
}
