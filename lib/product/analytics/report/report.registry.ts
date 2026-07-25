/**
 * Product Analytics — Report registry
 */

import { REPORT_KINDS } from "../foundation/foundation.constants";
import { getPipeline } from "../pipeline/pipeline.registry";
import type {
  AnalyticsReport,
  GenerateReportInput,
  ReportKind,
} from "./report.types";

const reports = new Map<string, AnalyticsReport>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneReport(report: AnalyticsReport): AnalyticsReport {
  return { ...report, metadata: { ...report.metadata } };
}

export function generateReport(input: GenerateReportInput): AnalyticsReport {
  const pipelineId = input.pipelineId.trim();
  const title = input.title.trim();
  if (!pipelineId) throw new Error("report.pipelineId is required");
  if (!title) throw new Error("report.title is required");
  if (!(REPORT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid report kind: ${input.kind}`);
  }

  const pipeline = getPipeline(pipelineId);
  if (!pipeline) throw new Error(`pipeline not found: ${pipelineId}`);
  if (pipeline.status !== "SUCCEEDED") {
    throw new Error(`pipeline not succeeded: ${pipelineId}`);
  }

  const id = input.id?.trim() || createId("anlrpt");
  if (reports.has(id)) throw new Error(`report already exists: ${id}`);

  const report: AnalyticsReport = {
    id,
    pipelineId,
    kind: input.kind,
    title,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    generatedAt: nowIso(),
  };
  reports.set(id, report);
  return cloneReport(report);
}

export function getReport(id: string): AnalyticsReport | undefined {
  const report = reports.get(id.trim());
  return report ? cloneReport(report) : undefined;
}

export function listReports(filter?: {
  kind?: ReportKind;
  pipelineId?: string;
}): AnalyticsReport[] {
  let result = [...reports.values()];
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  if (filter?.pipelineId) {
    const pipelineId = filter.pipelineId.trim();
    result = result.filter((r) => r.pipelineId === pipelineId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneReport);
}

export function clearReports(): void {
  reports.clear();
}
