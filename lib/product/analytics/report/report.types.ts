/**
 * Product Analytics — Report types
 */

import type { REPORT_KINDS } from "../foundation/foundation.constants";

export type ReportKind = (typeof REPORT_KINDS)[number];
export type ReportMetadata = Record<string, unknown>;

export type AnalyticsReport = {
  id: string;
  pipelineId: string;
  kind: ReportKind;
  title: string;
  detail: string;
  metadata: ReportMetadata;
  generatedAt: string;
};

export type GenerateReportInput = {
  id?: string;
  pipelineId: string;
  kind: ReportKind;
  title: string;
  metadata?: ReportMetadata;
};
