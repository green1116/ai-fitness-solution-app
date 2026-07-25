/**
 * Product Report — Render types
 */

export type RenderMetadata = Record<string, unknown>;

export type ReportRender = {
  id: string;
  jobId: string;
  artifactUri: string;
  byteSize: number;
  detail: string;
  metadata: RenderMetadata;
  renderedAt: string;
};

export type RenderReportInput = {
  id?: string;
  jobId: string;
  artifactUri: string;
  byteSize: number;
  metadata?: RenderMetadata;
};
