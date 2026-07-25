/**
 * Product Analytics — Dataset types
 */

import type { DATASET_STATUSES } from "../foundation/foundation.constants";

export type DatasetStatus = (typeof DATASET_STATUSES)[number];
export type DatasetMetadata = Record<string, unknown>;

export type AnalyticsDataset = {
  id: string;
  name: string;
  source: string;
  status: DatasetStatus;
  detail: string;
  metadata: DatasetMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterDatasetInput = {
  id?: string;
  name: string;
  source: string;
  metadata?: DatasetMetadata;
};

export type UpdateDatasetStatusInput = {
  datasetId: string;
  status: DatasetStatus;
};
