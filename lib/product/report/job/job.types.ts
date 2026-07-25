/**
 * Product Report — Job types
 */

import type {
  REPORT_FORMATS,
  REPORT_JOB_STATUSES,
} from "../engine/engine.constants";

export type ReportJobStatus = (typeof REPORT_JOB_STATUSES)[number];
export type ReportFormat = (typeof REPORT_FORMATS)[number];
export type JobMetadata = Record<string, unknown>;

export type ReportJob = {
  id: string;
  templateId: string;
  format: ReportFormat;
  status: ReportJobStatus;
  detail: string;
  metadata: JobMetadata;
  queuedAt: string;
  finishedAt?: string;
};

export type QueueReportJobInput = {
  id?: string;
  templateId: string;
  format: ReportFormat;
  metadata?: JobMetadata;
};

export type CompleteReportJobInput = {
  jobId: string;
  status: "SUCCEEDED" | "FAILED";
};
