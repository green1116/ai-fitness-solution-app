/**
 * Product Report — Job registry
 */

import {
  REPORT_FORMATS,
  REPORT_JOB_STATUSES,
} from "../engine/engine.constants";
import { getTemplate } from "../template/template.registry";
import type {
  CompleteReportJobInput,
  QueueReportJobInput,
  ReportFormat,
  ReportJob,
  ReportJobStatus,
} from "./job.types";

const jobs = new Map<string, ReportJob>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneJob(job: ReportJob): ReportJob {
  return { ...job, metadata: { ...job.metadata } };
}

export function queueReportJob(input: QueueReportJobInput): ReportJob {
  const templateId = input.templateId.trim();
  if (!templateId) throw new Error("job.templateId is required");
  if (!(REPORT_FORMATS as readonly string[]).includes(input.format)) {
    throw new Error(`invalid report format: ${input.format}`);
  }
  if (!getTemplate(templateId)) {
    throw new Error(`template not found: ${templateId}`);
  }

  const id = input.id?.trim() || createId("rptjob");
  if (jobs.has(id)) throw new Error(`report job already exists: ${id}`);

  const job: ReportJob = {
    id,
    templateId,
    format: input.format,
    status: REPORT_JOB_STATUSES[0],
    detail: `format=${input.format} status=QUEUED`,
    metadata: { ...(input.metadata ?? {}) },
    queuedAt: nowIso(),
  };
  jobs.set(id, job);
  return cloneJob(job);
}

export function completeReportJob(
  input: CompleteReportJobInput,
): ReportJob {
  const jobId = input.jobId.trim();
  if (!jobId) throw new Error("job.jobId is required");

  const existing = jobs.get(jobId);
  if (!existing) throw new Error(`report job not found: ${jobId}`);
  if (existing.status === "SUCCEEDED" || existing.status === "FAILED") {
    throw new Error(`report job already finished: ${jobId}`);
  }

  const updated: ReportJob = {
    ...existing,
    status: input.status,
    detail: `format=${existing.format} status=${input.status}`,
    metadata: { ...existing.metadata },
    finishedAt: nowIso(),
  };
  jobs.set(jobId, updated);
  return cloneJob(updated);
}

export function getReportJob(id: string): ReportJob | undefined {
  const job = jobs.get(id.trim());
  return job ? cloneJob(job) : undefined;
}

export function listReportJobs(filter?: {
  status?: ReportJobStatus;
  format?: ReportFormat;
}): ReportJob[] {
  let result = [...jobs.values()];
  if (filter?.status) {
    result = result.filter((j) => j.status === filter.status);
  }
  if (filter?.format) {
    result = result.filter((j) => j.format === filter.format);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneJob);
}

export function clearReportJobs(): void {
  jobs.clear();
}
