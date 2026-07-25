/**
 * Product Analytics — Pipeline types
 */

import type { PIPELINE_STATUSES } from "../foundation/foundation.constants";

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];
export type PipelineMetadata = Record<string, unknown>;

export type AnalyticsPipeline = {
  id: string;
  datasetId: string;
  metricId: string;
  status: PipelineStatus;
  detail: string;
  metadata: PipelineMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreatePipelineInput = {
  id?: string;
  datasetId: string;
  metricId: string;
  metadata?: PipelineMetadata;
};

export type RunPipelineInput = {
  pipelineId: string;
};
