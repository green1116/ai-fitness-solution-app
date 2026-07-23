/**
 * Commercialization P6 — Report generator
 */

import { REPORT_KINDS } from "../kpi/kpi.constants";
import { listAnalyticsSnapshots } from "../analytics/analytics.engine";
import { listCustomerScoreCards } from "../customer/customer.score";
import { listRevenueKpis } from "../kpi/kpi.registry";
import { listRevenueMetrics } from "../revenue/revenue.metrics";
import type {
  GenerateReportInput,
  RevenueReport,
} from "./report.types";

const reports = new Map<string, RevenueReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(report: RevenueReport): RevenueReport {
  return {
    ...report,
    sections: [...report.sections],
    highlights: [...report.highlights],
  };
}

export function generateRevenueReport(
  input: GenerateReportInput,
): RevenueReport {
  if (!(REPORT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid report kind: ${input.kind}`);
  }

  const metrics = listRevenueMetrics();
  const analytics = listAnalyticsSnapshots(
    input.accountRef ? { accountRef: input.accountRef } : undefined,
  );
  const kpis = listRevenueKpis();
  const scores = listCustomerScoreCards(
    input.accountRef ? { accountRef: input.accountRef } : undefined,
  );

  const latestMetrics = metrics[metrics.length - 1];
  const latestAnalytics = analytics[analytics.length - 1];
  const avgKpi =
    kpis.length === 0
      ? 0
      : Math.round(
          kpis.reduce((sum, k) => sum + k.attainment, 0) / kpis.length,
        );
  const avgScore =
    scores.length === 0
      ? 0
      : Math.round(
          scores.reduce((sum, s) => sum + s.compositeScore, 0) /
            scores.length,
        );

  const overallScore = Math.round(
    (avgKpi + avgScore + (latestAnalytics?.growthRate ?? 0)) / 3,
  );

  const sections = [
    "revenue-metrics",
    "analytics",
    "kpi-attainment",
    "customer-scores",
  ];
  const highlights: string[] = [];
  if (latestMetrics) {
    highlights.push(`total-revenue=${latestMetrics.totalRevenue}`);
  }
  if (latestAnalytics) {
    highlights.push(`growth=${latestAnalytics.growthRate}`);
  }
  highlights.push(`kpi-attainment=${avgKpi}%`);
  highlights.push(`customer-score=${avgScore}`);

  const id = input.id?.trim() || createId("rrep");
  if (reports.has(id)) {
    throw new Error(`revenue report already exists: ${id}`);
  }

  const report: RevenueReport = {
    id,
    kind: input.kind,
    title:
      (input.title ?? `${input.kind} Revenue Intelligence`).trim() ||
      `${input.kind} Revenue Intelligence`,
    sections,
    highlights,
    overallScore,
    detail: `kind=${input.kind} score=${overallScore}`,
    generatedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getRevenueReport(id: string): RevenueReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listRevenueReports(filter?: {
  kind?: GenerateReportInput["kind"];
}): RevenueReport[] {
  let result = [...reports.values()];
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReport);
}

export function clearRevenueReports(): void {
  reports.clear();
}
