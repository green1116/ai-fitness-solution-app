/**
 * Product P8 — Export types
 */

import type { EXPORT_FORMATS } from "../tender/tender.constants";

export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type ExportMetadata = Record<string, unknown>;

export type TenderExport = {
  id: string;
  tenderId: string;
  format: ExportFormat;
  documentIds: string[];
  artifactPath: string;
  detail: string;
  metadata: ExportMetadata;
  exportedAt: string;
};

export type CreateExportInput = {
  id?: string;
  tenderId: string;
  format: ExportFormat;
  documentIds: string[];
  artifactPath?: string;
  metadata?: ExportMetadata;
};
