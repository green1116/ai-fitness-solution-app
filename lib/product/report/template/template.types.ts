/**
 * Product Report — Template types
 */

import type { REPORT_TEMPLATE_KINDS } from "../engine/engine.constants";

export type ReportTemplateKind = (typeof REPORT_TEMPLATE_KINDS)[number];
export type TemplateMetadata = Record<string, unknown>;

export type ReportTemplate = {
  id: string;
  code: string;
  name: string;
  kind: ReportTemplateKind;
  boardId: string;
  detail: string;
  metadata: TemplateMetadata;
  createdAt: string;
};

export type RegisterTemplateInput = {
  id?: string;
  code: string;
  name: string;
  kind: ReportTemplateKind;
  boardId: string;
  metadata?: TemplateMetadata;
};
